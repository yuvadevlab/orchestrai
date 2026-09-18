/**
 * @file packages/core/src/executions/execution-status.schema.ts
 * @description Formal state machine enum and transition guards for agent execution lifecycles.
 */

import { z } from "zod";
import { ExecutionStatus } from "@orchestrai/shared-types";

/**
 * Valid lifecycle states for an execution run backed by ExecutionStatus enum.
 */
export const ExecutionStatusSchema = z
  .nativeEnum(ExecutionStatus)
  .describe("Current state machine status of an execution run");

/**
 * Valid directed state machine transition table.
 */
const VALID_TRANSITIONS: Readonly<Record<ExecutionStatus, ReadonlySet<ExecutionStatus>>> = {
  [ExecutionStatus.CREATED]: new Set([
    ExecutionStatus.QUEUED,
    ExecutionStatus.RUNNING,
    ExecutionStatus.CANCELLED,
  ]),
  [ExecutionStatus.QUEUED]: new Set([ExecutionStatus.RUNNING, ExecutionStatus.CANCELLED]),
  [ExecutionStatus.RUNNING]: new Set([
    ExecutionStatus.WAITING_FOR_APPROVAL,
    ExecutionStatus.COMPLETED,
    ExecutionStatus.FAILED,
    ExecutionStatus.CANCELLED,
  ]),
  [ExecutionStatus.WAITING_FOR_APPROVAL]: new Set([
    ExecutionStatus.RUNNING,
    ExecutionStatus.FAILED,
    ExecutionStatus.CANCELLED,
  ]),
  [ExecutionStatus.COMPLETED]: new Set([]), // Terminal
  [ExecutionStatus.FAILED]: new Set([]), // Terminal
  [ExecutionStatus.CANCELLED]: new Set([]), // Terminal
};

/**
 * Asserts whether a transition between two execution states is valid.
 *
 * @param fromStatus - The initial execution status.
 * @param toStatus - The desired target status.
 * @returns True if the transition is allowed by the formal state machine.
 */
export function isValidExecutionTransition(
  fromStatus: ExecutionStatus,
  toStatus: ExecutionStatus,
): boolean {
  const allowedTargets = VALID_TRANSITIONS[fromStatus];

  // If no targets are registered, fromStatus is already terminal
  if (!allowedTargets) {
    return false;
  }

  // Verify toStatus exists in the explicit set of permitted transitions
  return allowedTargets.has(toStatus);
}

/**
 * Checks whether an execution status is terminal (cannot transition further).
 *
 * @param status - The status to evaluate.
 * @returns True if the status is terminal.
 */
export function isTerminalExecutionStatus(status: ExecutionStatus): boolean {
  return (
    status === ExecutionStatus.COMPLETED ||
    status === ExecutionStatus.FAILED ||
    status === ExecutionStatus.CANCELLED
  );
}
