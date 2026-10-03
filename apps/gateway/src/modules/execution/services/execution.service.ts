/**
 * @file apps/gateway/src/modules/execution/execution.service.ts
 * @description Domain orchestration service managing agent execution lifecycle, SSE streaming,
 * and PostgreSQL persistence via injected hexagonal ports.
 *
 * This service bridges the HTTP layer with the {@link IExecutionRepository} and {@link IQueueProducer}
 * ports to dispatch executions either synchronously (live SSE) or asynchronously (BullMQ worker queue).
 * @module apps/gateway/modules/execution
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import { ExecutionStatus, MessageRole } from "@orchestrai/shared-types";
import type { IExecutionRepository, IQueueProducer } from "@orchestrai/core";
import type { CreateExecutionDto, ExecutionFilterDto, ResumeExecutionDto } from "@/validation";
import type { GatewayResponse } from "@/routes/http-types";
import { PostgresExecutionRepository } from "../repositories/execution.repository";
import { BullMQQueueProducerAdapter } from "@/infra";
import { resolveDbTenantId } from "@/modules/tenant-resolver";
import { liveExecutionManager } from "@/modules/streaming/live-execution.manager";
import { ExecutionQueryService } from "./execution-query.service";
import { ExecutionDispatcher } from "./execution-dispatcher";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ExecutionService"));

/**
 * Serialisable representation of an execution record returned over HTTP.
 */
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
  result?: { output?: string; error?: string };
}

/**
 * Paginated list response for execution history queries.
 */
export interface ExecutionListResult {
  items: ExecutionRecord[];
  filter: ExecutionFilterDto;
  total: number;
  hasMore: boolean;
}

/**
 * Orchestration service for the execution lifecycle.
 * Injects repository and queue ports to remain storage and queue-agnostic.
 */
export class ExecutionService {
  private readonly dispatcher: ExecutionDispatcher;

  constructor(
    private readonly executionRepo: IExecutionRepository = new PostgresExecutionRepository(),
    private readonly queueProducer: IQueueProducer = new BullMQQueueProducerAdapter(),
    private readonly queryService: ExecutionQueryService = new ExecutionQueryService(),
  ) {
    this.dispatcher = new ExecutionDispatcher(this.db, this.executionRepo, this.queueProducer);
  }

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Creates and dispatches an agent execution run.
   */
  public async createExecution(
    dto: CreateExecutionDto,
    tenantId: string,
  ): Promise<ExecutionRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    logger.info("Creating execution run", {
      agentId: dto.agentId,
      tenantId: resolvedTenantId,
      hasConversation: !!dto.conversationId,
    });

    const targetAgent = await this.dispatcher.resolveTargetAgent(dto.agentId, resolvedTenantId);
    const validConvId = await this.dispatcher.ensureConversation(
      dto.conversationId,
      resolvedTenantId,
      targetAgent.agentId,
      dto.input,
    );

    const modelName = typeof dto.variables?.model === "string" ? dto.variables.model : undefined;
    const systemPrompt =
      typeof dto.variables?.systemPrompt === "string"
        ? dto.variables.systemPrompt
        : targetAgent.systemPrompt;

    const row = await this.executionRepo.create({
      agentId: targetAgent.agentId,
      tenantId: resolvedTenantId,
      conversationId: validConvId || undefined,
      input: dto.input || "",
      status: ExecutionStatus.RUNNING,
      metadata: { ...(modelName ? { model: modelName } : {}), ...(dto.variables || {}) },
    });

    logger.info("Execution persisted via repository port", {
      executionId: row.id,
      agentId: row.agentId,
      tenantId: row.tenantId,
    });

    if (dto.input && validConvId) {
      await this.db.message.create({
        data: {
          executionId: row.id,
          conversationId: validConvId,
          role: MessageRole.USER,
          content: dto.input,
        },
      });
    }

    this.dispatcher.dispatch(
      row.id,
      targetAgent,
      resolvedTenantId,
      validConvId,
      dto,
      modelName,
      systemPrompt,
    );

    return {
      executionId: row.id,
      agentId: row.agentId,
      conversationId: row.conversationId,
      status: row.status,
      tenantId: row.tenantId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Attaches an active SSE response stream to an in-flight execution.
   */
  public streamExecution(executionId: string, res: GatewayResponse): void {
    liveExecutionManager.attachSseStream(executionId, res);
  }

  /**
   * Queries paginated execution history for the given tenant.
   */
  public async listExecutions(
    filter: ExecutionFilterDto,
    tenantId: string,
  ): Promise<ExecutionListResult> {
    return this.queryService.listExecutions(filter, tenantId);
  }

  /**
   * Fetches a single execution by ID within a tenant scope.
   */
  public async getExecutionById(executionId: string, tenantId: string): Promise<ExecutionRecord> {
    return this.queryService.getExecutionById(executionId, tenantId);
  }

  /**
   * Cancels an active execution:
   *  1. Signals the live SSE autonomous turn loop to stop via the execution manager
   *  2. Persists CANCELLED status to the database
   */
  public async cancelExecution(
    executionId: string,
    tenantId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus; cancelledAt: string }> {
    // Signal the in-process live execution to stop after the current turn
    this.dispatcher.cancelLiveExecution(executionId);
    return this.queryService.cancelExecution(executionId, tenantId);
  }

  /**
   * Resumes a paused or halted execution with a new HITL decision or continuation payload.
   */
  public async resumeExecution(
    executionId: string,
    dto: ResumeExecutionDto,
    tenantId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus; action: string; resumedAt: string }> {
    return this.queryService.resumeExecution(executionId, dto, tenantId);
  }
}
