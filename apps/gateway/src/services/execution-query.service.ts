/**
 * @file apps/gateway/src/services/execution-query.service.ts
 * @description Query and lifecycle management service for agent execution entities.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import { ExecutionStatus } from "@orchestrai/shared-types";
import type { ExecutionFilterDto, ResumeExecutionDto } from "@/validation";
import { resolveDbTenantId } from "./tenant-resolver";
import { liveExecutionManager } from "./live-execution.manager";
import { toPrismaStatus, toSharedStatus } from "./execution-status.mapper";
import type { ExecutionListResult, ExecutionRecord } from "./execution.service";

/**
 * Service encapsulating execution retrieval, filtering, cancellation and resumption.
 */
export class ExecutionQueryService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  public async listExecutions(
    filter: ExecutionFilterDto,
    tenantId: string,
  ): Promise<ExecutionListResult> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const limit = filter.limit || 20;

    const rows = await this.db.execution.findMany({
      where: {
        tenantId: resolvedTenantId,
        ...(filter.agentId && { agentId: filter.agentId }),
        ...(filter.conversationId && { conversationId: filter.conversationId }),
        ...(filter.status && { status: toPrismaStatus(filter.status) }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const total = await this.db.execution.count({
      where: {
        tenantId: resolvedTenantId,
        ...(filter.agentId && { agentId: filter.agentId }),
        ...(filter.conversationId && { conversationId: filter.conversationId }),
        ...(filter.status && { status: toPrismaStatus(filter.status) }),
      },
    });

    const items: ExecutionRecord[] = rows.map((e) => {
      const state = liveExecutionManager.getState(e.executionId);
      return {
        executionId: e.executionId,
        agentId: e.agentId,
        conversationId: e.conversationId,
        status: state?.status || toSharedStatus(e.status),
        tenantId: e.tenantId,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        result: state ? { output: state.fullOutput, error: state.error } : undefined,
      };
    });

    return { items, filter, total, hasMore: total > limit };
  }

  public async getExecutionById(executionId: string, tenantId: string): Promise<ExecutionRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const row = await this.db.execution.findFirst({
      where: { executionId, tenantId: resolvedTenantId },
    });

    const streamState = liveExecutionManager.getState(executionId);

    if (row) {
      return {
        executionId: row.executionId,
        agentId: row.agentId,
        conversationId: row.conversationId,
        status: streamState?.status || toSharedStatus(row.status),
        tenantId: row.tenantId,
        createdAt: row.createdAt.toISOString(),
        updatedAt: streamState?.completedAt || row.updatedAt.toISOString(),
        result: streamState
          ? { output: streamState.fullOutput, error: streamState.error }
          : undefined,
      };
    }

    return {
      executionId,
      agentId: "00000000-0000-0000-0000-000000000000",
      status: streamState?.status || ExecutionStatus.COMPLETED,
      tenantId: resolvedTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      result: streamState
        ? { output: streamState.fullOutput, error: streamState.error }
        : undefined,
    };
  }

  public async cancelExecution(
    executionId: string,
    tenantId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus; cancelledAt: string }> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const now = new Date();

    await this.db.execution.updateMany({
      where: { executionId, tenantId: resolvedTenantId },
      data: { status: "cancelled", completedAt: now },
    });

    return { executionId, status: ExecutionStatus.CANCELLED, cancelledAt: now.toISOString() };
  }

  public async resumeExecution(
    executionId: string,
    dto: ResumeExecutionDto,
    tenantId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus; action: string; resumedAt: string }> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const now = new Date();

    await this.db.execution.updateMany({
      where: { executionId, tenantId: resolvedTenantId },
      data: { status: "running", updatedAt: now },
    });

    return {
      executionId,
      status: ExecutionStatus.RUNNING,
      action: dto.action,
      resumedAt: now.toISOString(),
    };
  }
}
