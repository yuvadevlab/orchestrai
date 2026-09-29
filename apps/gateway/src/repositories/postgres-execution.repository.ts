/**
 * @file apps/gateway/src/repositories/postgres-execution.repository.ts
 * @description PostgreSQL Prisma adapter implementing the core IExecutionRepository port.
 * All database reads and writes are isolated here so the rest of the codebase
 * depends only on the abstract {@link IExecutionRepository} port from `@orchestrai/core`.
 * @module apps/gateway/repositories
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import type {
  IExecutionRepository,
  ExecutionEntity,
  CreateExecutionEntityData,
  ListExecutionsFilter,
} from "@orchestrai/core";
import { ExecutionStatus, type PaginatedResult } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { toPrismaStatus } from "@/modules/execution/execution-status.mapper";
import { mapExecutionToEntity } from "./execution-entity.mapper";

const logger = loggerWithConfig(new Logger("PostgresExecutionRepository"));

/**
 * PostgreSQL Prisma adapter implementing {@link IExecutionRepository}.
 *
 * Handles all persistence concerns for {@link ExecutionEntity} objects, including
 * creation, status patching, pagination, and soft-cancel workflows. The adapter
 * translates between the domain `ExecutionStatus` enum and the Prisma-generated
 * `$Enums.ExecutionStatus` to preserve full hexagonal port isolation.
 */
export class PostgresExecutionRepository implements IExecutionRepository {
  /**
   * Initialises the repository with an injected or default Prisma client.
   *
   * @param prisma - Optional PrismaClient override (useful for testing or connection pooling)
   */
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  /**
   * Retrieves an execution run by its unique UUID.
   *
   * @param id - Execution UUID to look up
   * @param tenantId - Optional tenant scope for multi-tenant isolation
   * @returns The matching {@link ExecutionEntity} or `null` if not found
   */
  public async findById(id: string, tenantId?: string): Promise<ExecutionEntity | null> {
    logger.debug("findById: looking up execution", { executionId: id, tenantId });

    const record = await this.prisma.execution.findFirst({
      where: {
        executionId: id,
        // Constrain query to tenant scope when tenant context is provided
        ...(tenantId ? { tenantId } : {}),
      },
    });

    if (!record) {
      // Propagate a null domain signal — caller decides whether this is a 404 or an expected miss
      logger.debug("findById: execution not found", { executionId: id });
      return null;
    }

    logger.debug("findById: execution found", { executionId: id, status: record.status });
    return mapExecutionToEntity(record);
  }

  /**
   * Persists a new execution run record in the database.
   *
   * @param data - Creation attributes for the new execution
   * @returns Newly created and hydrated {@link ExecutionEntity}
   */
  public async create(data: CreateExecutionEntityData): Promise<ExecutionEntity> {
    logger.info("create: persisting new execution via IExecutionRepository port", {
      agentId: data.agentId,
      tenantId: data.tenantId,
      status: data.status,
      hasConversation: !!data.conversationId,
    });

    try {
      const record = await this.prisma.execution.create({
        data: {
          // Allow caller-controlled UUID for idempotent creation patterns
          ...(data.id ? { executionId: data.id } : {}),
          agentId: data.agentId,
          tenantId: data.tenantId,
          conversationId: data.conversationId || null,
          status: toPrismaStatus(data.status),
          // Persist trace identifier for distributed tracing correlation
          traceId: (data.metadata?.traceId as string) || `trace_${Date.now()}`,
          variables: {
            input: data.input,
            ...(data.metadata || {}),
          } as Prisma.InputJsonValue,
        },
      });

      logger.info("create: execution record persisted", { executionId: record.executionId });
      return mapExecutionToEntity(record);
    } catch (err: unknown) {
      logger.error("create: failed to persist execution record", {
        agentId: data.agentId,
        tenantId: data.tenantId,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Updates an execution's status and optional output metadata.
   *
   * @param id - Execution UUID to update
   * @param status - New domain {@link ExecutionStatus} to apply
   * @param patch - Optional payload enrichments (output text, error message, metadata)
   * @returns Updated {@link ExecutionEntity} reflecting the new state
   */
  public async updateStatus(
    id: string,
    status: ExecutionStatus,
    patch?: {
      output?: string;
      error?: string;
      metadata?: Record<string, unknown>;
      totalTokens?: number;
      durationMs?: number;
    },
  ): Promise<ExecutionEntity> {
    // Determine whether this transition marks a terminal state requiring completedAt timestamp
    const isTerminal =
      status === ExecutionStatus.COMPLETED ||
      status === ExecutionStatus.FAILED ||
      status === ExecutionStatus.CANCELLED;

    logger.info("updateStatus: transitioning execution state", {
      executionId: id,
      newStatus: status,
      isTerminal,
      hasOutputPatch: !!patch?.output,
      hasErrorPatch: !!patch?.error,
    });

    try {
      const record = await this.prisma.execution.update({
        where: { executionId: id },
        data: {
          status: toPrismaStatus(status),
          // Set completedAt only when reaching a terminal state to preserve first-transition semantics
          ...(isTerminal ? { completedAt: new Date() } : {}),
          // Persist metadata patch into the variables JSON column
          ...(patch?.metadata ? { variables: patch.metadata as Prisma.InputJsonValue } : {}),
        },
      });

      logger.debug("updateStatus: execution state updated", { executionId: id, newStatus: status });
      return mapExecutionToEntity(record, patch);
    } catch (err: unknown) {
      logger.error("updateStatus: failed to update execution status", {
        executionId: id,
        status,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Queries a paginated list of execution records scoped by the provided filter criteria.
   *
   * @param filter - Pagination offsets and optional filtering by tenant, agent, conversation, or status
   * @returns {@link PaginatedResult} wrapping the matching {@link ExecutionEntity} items
   */
  public async list(filter: ListExecutionsFilter): Promise<PaginatedResult<ExecutionEntity>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    logger.debug("list: querying execution history", {
      tenantId: filter.tenantId,
      agentId: filter.agentId,
      page,
      limit,
    });

    const where = {
      ...(filter.tenantId ? { tenantId: filter.tenantId } : {}),
      ...(filter.agentId ? { agentId: filter.agentId } : {}),
      ...(filter.conversationId ? { conversationId: filter.conversationId } : {}),
      // Map domain enum to Prisma enum before applying status filter clause
      ...(filter.status ? { status: toPrismaStatus(filter.status) } : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.execution.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.execution.count({ where }),
    ]);

    logger.debug("list: execution query returned results", {
      total,
      page,
      limit,
      count: records.length,
    });
    return {
      items: records.map((r) => mapExecutionToEntity(r)),
      total,
      page,
      limit,
      hasMore: skip + records.length < total,
    };
  }

  /**
   * Cancels an active execution by transitioning it to `CANCELLED` status.
   *
   * @param id - Execution UUID to cancel
   * @param reason - Optional human-readable cancellation reason for audit logs
   * @returns Updated {@link ExecutionEntity} in `CANCELLED` state
   */
  public async cancel(id: string, reason?: string): Promise<ExecutionEntity> {
    logger.warn("cancel: marking execution as CANCELLED", { executionId: id, reason });
    return this.updateStatus(id, ExecutionStatus.CANCELLED, {
      error: reason || "Execution cancelled by operator",
    });
  }
}
