/**
 * @file packages/core/src/ports/execution-repository.port.ts
 * @description Abstract storage port for agent execution runs, lifecycle transitions, and telemetry.
 * @module @orchestrai/core/ports
 */

import type { ExecutionStatus, PaginatedResult } from "@orchestrai/shared-types";

/**
 * Domain representation of an execution entity returned from repository queries.
 */
export interface ExecutionEntity {
  readonly id: string;
  readonly agentId: string;
  readonly tenantId: string;
  readonly conversationId?: string;
  readonly status: ExecutionStatus;
  readonly input: string;
  readonly output?: string;
  readonly error?: string;
  readonly metadata?: Record<string, unknown>;
  readonly totalTokens?: number;
  readonly durationMs?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Input DTO for persisting a new execution run.
 */
export interface CreateExecutionEntityData {
  readonly id?: string;
  readonly agentId: string;
  readonly tenantId: string;
  readonly conversationId?: string;
  readonly input: string;
  readonly status?: ExecutionStatus;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Filter criteria for querying execution collections.
 */
export interface ListExecutionsFilter {
  readonly tenantId?: string;
  readonly agentId?: string;
  readonly conversationId?: string;
  readonly status?: ExecutionStatus;
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Abstract repository port isolating core execution logic from specific persistence engines (Prisma, Postgres, Memory).
 */
export interface IExecutionRepository {
  /**
   * Retrieves an execution run by its unique identifier.
   */
  findById(id: string, tenantId?: string): Promise<ExecutionEntity | null>;

  /**
   * Persists a new execution run in the storage engine.
   */
  create(data: CreateExecutionEntityData): Promise<ExecutionEntity>;

  /**
   * Transitions execution state and attaches optional error or completion metadata.
   */
  updateStatus(
    id: string,
    status: ExecutionStatus,
    patch?: {
      output?: string;
      error?: string;
      metadata?: Record<string, unknown>;
      totalTokens?: number;
      durationMs?: number;
    },
  ): Promise<ExecutionEntity>;

  /**
   * Queries paginated execution records matching filter criteria.
   */
  list(filter: ListExecutionsFilter): Promise<PaginatedResult<ExecutionEntity>>;

  /**
   * Marks an active execution run as cancelled with an optional operator reason.
   */
  cancel(id: string, reason?: string): Promise<ExecutionEntity>;
}
