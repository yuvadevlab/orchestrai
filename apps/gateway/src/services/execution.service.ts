/**
 * @file apps/gateway/src/services/execution.service.ts
 * @description Domain orchestration service managing agent executions, history, and PostgreSQL persistence.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import { ExecutionStatus } from "@orchestrai/shared-types";
import type { CreateExecutionDto, ExecutionFilterDto, ResumeExecutionDto } from "@/validation";
import type { GatewayResponse } from "@/routes/http-types";
import { resolveDbTenantId } from "./tenant-resolver";
import { liveExecutionManager } from "./live-execution.manager";
import { toPrismaStatus, toSharedStatus } from "./execution-status.mapper";
import { ExecutionQueryService } from "./execution-query.service";

export interface ExecutionRecord {
  executionId: string;
  agentId: string;
  conversationId?: string | null;
  status: ExecutionStatus;
  mode?: string;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  resumedAt?: string;
  result?: {
    output?: string;
    error?: string;
  };
}

export interface ExecutionListResult {
  items: ExecutionRecord[];
  filter: ExecutionFilterDto;
  total: number;
  hasMore: boolean;
}

/**
 * Service encapsulating execution dispatch, streaming, multi-turn history, and PostgreSQL persistence.
 */
export class ExecutionService {
  private readonly queryService = new ExecutionQueryService();

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  public async createExecution(
    dto: CreateExecutionDto,
    tenantId: string,
  ): Promise<ExecutionRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    let targetAgent = await this.db.agent.findFirst({
      where: { agentId: dto.agentId, tenantId: resolvedTenantId, deletedAt: null },
    });

    if (!targetAgent) {
      targetAgent =
        (await this.db.agent.findFirst({
          where: { tenantId: resolvedTenantId, deletedAt: null },
        })) ||
        (await this.db.agent.create({
          data: {
            tenantId: resolvedTenantId,
            name: "Lead Orchestrator",
            systemPrompt: "You are the Lead Orchestrator.",
            modelConfig: { model: "gemma4:31b-cloud" },
          },
        }));
    }

    if (dto.conversationId) {
      const existingConv = await this.db.conversation.findUnique({
        where: { conversationId: dto.conversationId },
      });
      if (!existingConv) {
        await this.db.conversation.create({
          data: {
            conversationId: dto.conversationId,
            tenantId: resolvedTenantId,
            agentId: targetAgent.agentId,
            title: dto.input ? dto.input.slice(0, 36) : "Active Thread",
          },
        });
      }
    }

    const traceId = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const modelName = typeof dto.variables?.model === "string" ? dto.variables.model : undefined;

    const row = await this.db.execution.create({
      data: {
        tenantId: resolvedTenantId,
        agentId: targetAgent.agentId,
        conversationId: dto.conversationId,
        status: "running",
        traceId,
        variables: {
          input: dto.input,
          model: modelName || "gemma4:31b-cloud",
          ...(dto.variables || {}),
        } as Prisma.InputJsonValue,
      },
    });

    if (dto.input && dto.conversationId) {
      await this.db.message.create({
        data: {
          executionId: row.executionId,
          conversationId: dto.conversationId,
          role: "user",
          content: dto.input,
        },
      });
    }

    const systemPrompt =
      typeof dto.variables?.systemPrompt === "string"
        ? dto.variables.systemPrompt
        : targetAgent.systemPrompt;

    if (dto.input) {
      void liveExecutionManager
        .startExecution(
          row.executionId,
          dto.input,
          modelName,
          systemPrompt,
          dto.conversationId,
          dto.history,
        )
        .then(async () => {
          const state = liveExecutionManager.getState(row.executionId);
          if (state) {
            await this.db.execution.update({
              where: { executionId: row.executionId },
              data: {
                status: toPrismaStatus(state.status),
                completedAt: state.completedAt ? new Date(state.completedAt) : new Date(),
              },
            });

            if (dto.conversationId && state.fullOutput) {
              await this.db.message.create({
                data: {
                  executionId: row.executionId,
                  conversationId: dto.conversationId,
                  role: "assistant",
                  content: state.fullOutput,
                },
              });
            }
          }
        });
    }

    return {
      executionId: row.executionId,
      agentId: row.agentId,
      conversationId: row.conversationId,
      status: toSharedStatus(row.status),
      tenantId: row.tenantId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  public streamExecution(executionId: string, res: GatewayResponse): void {
    liveExecutionManager.attachSseStream(executionId, res);
  }

  public async listExecutions(
    filter: ExecutionFilterDto,
    tenantId: string,
  ): Promise<ExecutionListResult> {
    return this.queryService.listExecutions(filter, tenantId);
  }

  public async getExecutionById(executionId: string, tenantId: string): Promise<ExecutionRecord> {
    return this.queryService.getExecutionById(executionId, tenantId);
  }

  public async cancelExecution(
    executionId: string,
    tenantId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus; cancelledAt: string }> {
    return this.queryService.cancelExecution(executionId, tenantId);
  }

  public async resumeExecution(
    executionId: string,
    dto: ResumeExecutionDto,
    tenantId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus; action: string; resumedAt: string }> {
    return this.queryService.resumeExecution(executionId, dto, tenantId);
  }
}
