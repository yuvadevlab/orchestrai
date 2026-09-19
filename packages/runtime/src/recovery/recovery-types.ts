/**
 * @file packages/runtime/src/recovery/recovery-types.ts
 * @description Type definitions and contracts for crash detection and execution recovery planning.
 */

import type { RuntimeGraphState } from "@/nodes";

/**
 * Diagnostic summary of an interrupted or stalled execution run.
 */
export interface InterruptedExecutionInfo {
  /** Execution run identifier */
  readonly executionId: string;
  /** Highest step index recorded before interruption */
  readonly lastStepIndex: number;
  /** Name of the node actively executing or last completed */
  readonly lastNodeName: string;
  /** Timestamp of the last recorded checkpoint */
  readonly lastActiveTimestamp: Date;
  /** Whether the run is currently suspended waiting for human operator approval */
  readonly isPausedAtApproval: boolean;
  /** Whether the state integrity checksum matches the stored state payload */
  readonly stateHashValid: boolean;
}

/**
 * Strategy dictating how a stalled or interrupted run will be restored.
 */
export type RecoveryStrategy = "RESUME_IN_PLACE" | "FORK_AND_RESUME" | "FAIL_UNRECOVERABLE";

/**
 * Actionable blueprint for resuming an interrupted graph execution.
 */
export interface RecoveryPlan {
  /** Target execution run identifier */
  readonly executionId: string;
  /** Chosen recovery strategy */
  readonly strategy: RecoveryStrategy;
  /** Directed graph node to start execution from */
  readonly targetResumeNode: string;
  /** Fully reconstituted state object ready for invocation */
  readonly reconstitutedState: RuntimeGraphState;
  /** Diagnostic justification for the plan */
  readonly reason: string;
}
