/**
 * @file apps/orchestrator/src/grpc/grpc-execution.service.ts
 * @description Implementation of the IGrpcExecutionService gRPC interface for OrchestrAI.
 * Receives remote execution dispatch requests, coordinates DAG execution, and returns typed responses.
 * Enforces zero hardcoded strings by checking strictly against canonical enum keys.
 * @module apps/orchestrator/grpc
 */

import type {
  IGrpcExecutionService,
  GrpcExecutionRequest,
  GrpcExecutionResponse,
} from "@orchestrai/grpc";
import {
  ExecutionStatus,
  AgentMode,
  PlatformScope,
  PlatformCapabilitySlug,
  PlatformToolName,
} from "@orchestrai/shared-types";
import {
  ExecutionIdSchema,
  AGENT_EXECUTION_DEFAULTS,
  type AgentDefinition,
  AgentIdSchema,
} from "@orchestrai/core";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { getPrismaClient } from "@orchestrai/database";
import { DagExecutionEngine } from "@/runtime";
import { toCanonicalExecutionStatus } from "@/state-machine";

const logger = loggerWithConfig(new Logger("GrpcExecutionService"));

/**
 * Server implementation of {@link IGrpcExecutionService}.
 */
export class GrpcExecutionService implements IGrpcExecutionService {
  constructor(private readonly engine: DagExecutionEngine = new DagExecutionEngine()) {}

  /**
   * Handles remote execution dispatch request via gRPC.
   *
   * @param request - Validated gRPC dispatch payload
   * @returns Typed gRPC execution response
   */
  public async dispatchExecution(request: GrpcExecutionRequest): Promise<GrpcExecutionResponse> {
    logger.info("gRPC dispatchExecution invoked", {
      executionId: request.executionId,
      agentId: request.agentId,
      traceId: request.traceId,
    });

    const prisma = getPrismaClient();
    const dbAgent = await prisma.agent.findFirst({
      where: {
        agentId: request.agentId,
        deletedAt: null,
      },
    });

    // Guard against missing agent: Fail fast and instruct user to create one
    if (!dbAgent) {
      const errorMsg = `Agent with ID "${request.agentId}" does not exist. Please create an agent first.`;
      logger.error("gRPC dispatchExecution failed: agent not found", {
        agentId: request.agentId,
      });
      throw new Error(errorMsg);
    }

    const meta = (dbAgent.metadata as Record<string, unknown>) || {};
    const modelCfg = (dbAgent.modelConfig as Record<string, unknown>) || {};
    const resolvedModelName =
      (modelCfg.modelName as string) ||
      (modelCfg.model as string) ||
      process.env.DEFAULT_MODEL_NAME ||
      process.env.OLLAMA_DEFAULT_MODEL;

    // Guard against missing model configuration: require DB or env definition
    if (!resolvedModelName) {
      throw new Error(
        `Agent "${dbAgent.name}" has no model configured and DEFAULT_MODEL_NAME environment variable is not set.`,
      );
    }

    const agent: AgentDefinition = {
      agentId: AgentIdSchema.parse(dbAgent.agentId),
      tenantId: dbAgent.tenantId,
      scope: (meta.scope as PlatformScope) || PlatformScope.TENANT,
      name: dbAgent.name,
      description: dbAgent.description || "",
      systemPrompt: dbAgent.systemPrompt,
      mode: (dbAgent.mode as AgentMode) || AgentMode.AUTO,
      modelConfig: {
        modelName: resolvedModelName,
        temperature:
          typeof modelCfg.temperature === "number"
            ? modelCfg.temperature
            : AGENT_EXECUTION_DEFAULTS.FACTUAL_TEMPERATURE,
      },
      capabilities: Array.isArray(meta.capabilities)
        ? (meta.capabilities as PlatformCapabilitySlug[])
        : [],
      enabledTools: Array.isArray(dbAgent.enabledTools)
        ? (dbAgent.enabledTools as PlatformToolName[])
        : [],
      maxSteps:
        typeof meta.maxSteps === "number"
          ? meta.maxSteps
          : AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_STEPS,
      createdAt: dbAgent.createdAt,
      updatedAt: dbAgent.updatedAt,
    };

    // Run execution asynchronously; return initial running response
    void this.engine.executeDagRun(request.executionId, agent, request.inputPrompt).catch((err) => {
      logger.error("Async DAG execution error", {
        executionId: request.executionId,
        error: String(err),
      });
    });

    return {
      executionId: request.executionId,
      status: ExecutionStatus.RUNNING,
      currentStepIndex: 0,
    };
  }

  /**
   * Retrieves current execution status for a given execution run.
   *
   * @param executionId - Execution UUID identifier
   * @returns Typed gRPC execution response
   */
  public async getExecutionStatus(executionId: string): Promise<GrpcExecutionResponse> {
    logger.debug("gRPC getExecutionStatus invoked", { executionId });

    const validId = ExecutionIdSchema.parse(executionId);
    const rawState = this.engine.getExecutionState(validId);
    const status = toCanonicalExecutionStatus(rawState);

    const isCompleted = status === ExecutionStatus.COMPLETED;

    return {
      executionId: validId,
      status,
      currentStepIndex: isCompleted ? 5 : 1,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    };
  }
}
