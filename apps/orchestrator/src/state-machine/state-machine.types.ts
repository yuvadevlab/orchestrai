/**
 * @file apps/orchestrator/src/state-machine/state-machine.types.ts
 * @description State machine types, events, and transition definitions for agent execution lifecycles.
 * @module apps/orchestrator/state-machine
 */

import {
  ExecutionStatus,
  OrchestratorState,
  OrchestratorEventType,
} from "@orchestrai/shared-types";

export { OrchestratorState, OrchestratorEventType };

/**
 * Event triggers driving deterministic state transitions.
 */
export type OrchestratorEvent =
  | { type: OrchestratorEventType.START; payload?: { startedAt?: string } }
  | {
      type: OrchestratorEventType.TOOL_START;
      payload: { toolName: string; input: Record<string, unknown> };
    }
  | { type: OrchestratorEventType.TOOL_FINISH; payload?: { toolName: string; output: unknown } }
  | {
      type: OrchestratorEventType.REQUEST_APPROVAL;
      payload: { clearanceId: string; resource: string };
    }
  | {
      type: OrchestratorEventType.RESOLVE_APPROVAL;
      payload: { approved: boolean; decision: string };
    }
  | { type: OrchestratorEventType.COMPLETE; payload?: { output?: string; stepsCount: number } }
  | { type: OrchestratorEventType.FAIL; payload: { error: string; code?: string } }
  | { type: OrchestratorEventType.CANCEL; payload?: { reason?: string } };

/**
 * Transition listener callback invoked whenever a valid transition occurs.
 */
export type StateTransitionListener = (
  from: OrchestratorState,
  to: OrchestratorState,
  event: OrchestratorEvent,
) => void | Promise<void>;

/**
 * Maps an internal OrchestratorState to the shared ExecutionStatus enum using strict Enum comparisons.
 *
 * @param state - Internal state
 * @returns Standard canonical ExecutionStatus enum value
 */
export function toCanonicalExecutionStatus(state: OrchestratorState): ExecutionStatus {
  switch (state) {
    case OrchestratorState.PENDING:
      return ExecutionStatus.QUEUED;
    case OrchestratorState.RUNNING:
    case OrchestratorState.TOOL_CALL:
      return ExecutionStatus.RUNNING;
    case OrchestratorState.AWAITING_APPROVAL:
      return ExecutionStatus.WAITING_FOR_APPROVAL;
    case OrchestratorState.COMPLETED:
      return ExecutionStatus.COMPLETED;
    case OrchestratorState.FAILED:
      return ExecutionStatus.FAILED;
    case OrchestratorState.CANCELLED:
      return ExecutionStatus.CANCELLED;
  }
}
