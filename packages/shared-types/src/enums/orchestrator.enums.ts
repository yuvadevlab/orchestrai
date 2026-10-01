/**
 * @file packages/shared-types/src/enums/orchestrator.enums.ts
 * @description Enumerations governing the standalone execution orchestrator state machine and event broker.
 * @module @orchestrai/shared-types/enums
 */

/**
 * Deterministic finite state machine lifecycle phases for agent execution runs.
 */
export enum OrchestratorState {
  PENDING = "pending",
  RUNNING = "running",
  TOOL_CALL = "tool_call",
  AWAITING_APPROVAL = "awaiting_approval",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Event triggers driving orchestrator state machine transitions.
 */
export enum OrchestratorEventType {
  START = "start",
  TOOL_START = "tool_start",
  TOOL_FINISH = "tool_finish",
  REQUEST_APPROVAL = "request_approval",
  RESOLVE_APPROVAL = "resolve_approval",
  COMPLETE = "complete",
  FAIL = "fail",
  CANCEL = "cancel",
}

/**
 * Real-time event topic names emitted over Redis Pub/Sub channels.
 */
export enum OrchestratorPubSubEventName {
  RUN_START = "run_start",
  STATE_CHANGE = "state_change",
  TOKEN_DELTA = "token_delta",
  STEP_START = "step_start",
  STEP_FINISH = "step_finish",
  RUN_COMPLETE = "run_complete",
  RUN_FAILED = "run_failed",
  RUN_CANCELLED = "run_cancelled",
}
