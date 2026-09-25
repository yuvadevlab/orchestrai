/**
 * @file apps/gateway/src/services/execution-status.mapper.ts
 * @description Pure conversion helpers between Prisma and shared domain ExecutionStatus enums.
 * @module apps/gateway/services
 */

import type { ExecutionStatus as PrismaExecutionStatus } from "@orchestrai/database";
import { ExecutionStatus } from "@orchestrai/shared-types";

/**
 * Maps arbitrary status strings to Prisma's database enum.
 */
export function toPrismaStatus(status?: string): PrismaExecutionStatus {
  // Normalize to lowercase first to handle both legacy uppercase and new lowercase inputs.
  switch (status?.toLowerCase()) {
    case "running":
      return "running";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    case "suspended":
    case "waiting_for_approval":
      return "suspended";
    case "timed_out":
      return "timed_out";
    default:
      return "pending";
  }
}

/**
 * Maps Prisma database enum values to shared domain protocol enum.
 */
export function toSharedStatus(status: PrismaExecutionStatus | string): ExecutionStatus {
  // Match against lowercase DB enum values (migrated from uppercase).
  switch (status) {
    case "running":
      return ExecutionStatus.RUNNING;
    case "completed":
      return ExecutionStatus.COMPLETED;
    case "failed":
      return ExecutionStatus.FAILED;
    case "cancelled":
      return ExecutionStatus.CANCELLED;
    case "suspended":
      return ExecutionStatus.WAITING_FOR_APPROVAL;
    case "timed_out":
      return ExecutionStatus.FAILED;
    default:
      return ExecutionStatus.QUEUED;
  }
}
