/**
 * @file apps/gateway/src/repositories/execution-entity.mapper.ts
 * @description Domain mapper transforming raw Prisma Execution records into IExecutionRepository domain entities.
 * @module apps/gateway/repositories
 */

import type { ExecutionEntity } from "@orchestrai/core";
import { toSharedStatus } from "./execution-status.mapper";

/**
 * Maps a Prisma Execution database record to an immutable domain ExecutionEntity.
 *
 * @param record - Raw database row from the executions table
 * @param extra - Optional patch overrides for final output or error message
 * @returns Clean domain ExecutionEntity
 */
export function mapExecutionToEntity(
  record: {
    executionId: string;
    agentId: string;
    tenantId: string;
    conversationId: string | null;
    status: string;
    variables: unknown;
    createdAt: Date;
    updatedAt: Date;
  },
  extra?: { output?: string; error?: string },
): ExecutionEntity {
  // Extract execution input parameters and variables from JSON column
  const vars = (record.variables as Record<string, unknown>) || {};

  return {
    id: record.executionId,
    agentId: record.agentId,
    tenantId: record.tenantId,
    conversationId: record.conversationId || undefined,
    status: toSharedStatus(record.status),
    input: (vars.input as string) || "",
    // Prefer explicit extra output override when available from in-flight worker state
    output: extra?.output || (vars.output as string) || undefined,
    // Prefer explicit extra error override when available from failure handling
    error: extra?.error || (vars.error as string) || undefined,
    metadata: vars,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
