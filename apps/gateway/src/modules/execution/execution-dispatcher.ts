/**
 * @file apps/gateway/src/modules/execution/execution-dispatcher.ts
 * @description Dedicated execution dispatch coordinator for ExecutionService.
 * Handles agent resolution, thread initialization, queue enqueuing, and live SSE lifecycle management.
 * @module apps/gateway/modules/execution
 */

import { type PrismaClient, type Prisma, type Agent } from "@orchestrai/database";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import {
  ExecutionIdSchema,
  AgentIdSchema,
  type IExecutionRepository,
  type IQueueProducer,
} from "@orchestrai/core";
import { GrpcClient } from "@orchestrai/grpc";
import type { CreateExecutionDto } from "@/validation";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { liveExecutionManager } from "@/modules/streaming/live-execution.manager";
import { toSharedStatus } from "./execution-status.mapper";

const logger = loggerWithConfig(new Logger("ExecutionDispatcher"));

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Coordinates dispatching agent execution runs either to async BullMQ or live SSE.
 */
export class ExecutionDispatcher {
  constructor(
    private readonly db: PrismaClient,
    private readonly executionRepo: IExecutionRepository,
    private readonly queueProducer: IQueueProducer,
  ) {}

  /**
   * Resolves target agent or falls back to creating a tenant default.
   */
  public async resolveTargetAgent(agentId: string | undefined, tenantId: string): Promise<Agent> {
    let target = agentId
      ? await this.db.agent.findFirst({
          where: { agentId, tenantId, deletedAt: null },
        })
      : null;

    if (!target) {
      target =
        (await this.db.agent.findFirst({
          where: { tenantId, deletedAt: null },
        })) ||
        (await this.db.agent.create({
          data: {
            tenantId,
            name: "Lead Orchestrator",
            systemPrompt: "You are the Lead Orchestrator.",
            modelConfig: { model: "gemma4:31b-cloud" },
          },
        }));
    }

    return target;
  }

  /**
   * Validates and ensures conversation thread exists.
   */
  public async ensureConversation(
    conversationId: string | undefined,
    tenantId: string,
    agentId: string,
    inputSnippet?: string,
  ): Promise<string | null> {
    const validConvId = conversationId && UUID_REGEX.test(conversationId) ? conversationId : null;

    if (validConvId) {
      const existingConv = await this.db.conversation.findUnique({
        where: { conversationId: validConvId },
      });

      if (!existingConv) {
        await this.db.conversation.create({
          data: {
            conversationId: validConvId,
            tenantId,
            agentId,
            title: inputSnippet
              ? inputSnippet.slice(0, 36) + (inputSnippet.length > 36 ? "..." : "")
              : "Active Thread",
          },
        });
      }
    }

    return validConvId;
  }

  /**
   * Dispatches the execution either to async BullMQ queue or live SSE streaming loop.
   */
  public dispatch(
    executionId: string,
    targetAgent: { agentId: string; systemPrompt: string },
    resolvedTenantId: string,
    validConvId: string | null,
    dto: CreateExecutionDto,
    modelName?: string,
    systemPrompt?: string,
  ): void {
    if (!dto.input) return;

    if (dto.variables?.orchestrator === true || process.env.USE_ORCHESTRATOR_SERVICE === "true") {
      logger.info("Delegating execution run to Orchestrator microservice via gRPC", {
        executionId,
      });
      const grpcClient = new GrpcClient(process.env.ORCHESTRATOR_GRPC_HOST || "localhost:50051");
      void grpcClient.dispatchExecution({
        executionId: ExecutionIdSchema.parse(executionId),
        agentId: AgentIdSchema.parse(targetAgent.agentId),
        inputPrompt: dto.input,
        traceId: `tr_${Date.now()}`,
      });
      return;
    }

    const isAsyncQueue = dto.variables?.async === true || dto.variables?.background === true;

    if (isAsyncQueue) {
      logger.info("Dispatching execution to async worker queue", {
        executionId,
        queue: QUEUE_NAMES.AGENT_EXECUTION,
      });
      void this.queueProducer.enqueue(QUEUE_NAMES.AGENT_EXECUTION, "agent-execution", {
        executionId,
        agentId: targetAgent.agentId,
        tenantId: resolvedTenantId,
        input: dto.input,
        variables: dto.variables,
      });
    } else {
      logger.debug("Starting live SSE execution", { executionId, model: modelName });
      void liveExecutionManager
        .startExecution(
          executionId,
          dto.input,
          modelName,
          systemPrompt,
          validConvId || undefined,
          dto.history,
        )
        .then(async () => {
          await this.handleExecutionCompletion(executionId, validConvId, modelName);
        })
        .catch((err: unknown) => {
          logger.error("dispatch: unhandled error in live SSE execution pipeline", {
            executionId,
            error: err instanceof Error ? err.message : String(err),
          });
        });
    }
  }

  /**
   * Persists terminal execution state and assistant turn message upon live run completion.
   */
  private async handleExecutionCompletion(
    executionId: string,
    validConvId: string | null,
    modelName?: string,
  ): Promise<void> {
    const state = liveExecutionManager.getState(executionId);
    if (!state) {
      logger.warn("handleExecutionCompletion: live state missing", { executionId });
      return;
    }

    logger.info("handleExecutionCompletion: persisting final state", {
      executionId,
      terminalStatus: state.status,
      hasOutput: !!state.fullOutput,
      artifactCount: state.artifacts?.length ?? 0,
    });

    await this.executionRepo.updateStatus(executionId, toSharedStatus(state.status), {
      output: state.fullOutput,
      metadata: state.artifacts?.length ? { artifacts: state.artifacts } : undefined,
    });

    if (validConvId && state.fullOutput) {
      await this.db.message.create({
        data: {
          executionId,
          conversationId: validConvId,
          role: "assistant" as never,
          content: state.fullOutput,
          metadata: {
            ...(state.artifacts?.length ? { artifacts: state.artifacts } : {}),
            ...(modelName ? { model: modelName } : {}),
          } as unknown as Prisma.InputJsonValue,
        },
      });

      await this.db.conversation.update({
        where: { conversationId: validConvId },
        data: { updatedAt: new Date() },
      });
    }
  }
}
