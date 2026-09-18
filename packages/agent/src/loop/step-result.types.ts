/**
 * @file packages/agent/src/loop/step-result.types.ts
 * @description Type definitions for agent step results and lifecycle outcomes.
 */

import type { AIMessage, ToolResult } from "@orchestrai/core";

/**
 * High-level outcome of executing a single agent loop step.
 */
export type StepOutcome =
  /** Step completed, tools executed or more dialogue pending; loop continues */
  | "CONTINUE"
  /** Agent called a DANGEROUS tool requiring human confirmation before dispatch */
  | "WAITING_FOR_APPROVAL"
  /** Agent reached completion, max steps limit, or loop termination */
  | "HALTED"
  /** Step encountered an unrecoverable failure */
  | "ERROR";

/**
 * Information regarding a pending human approval request.
 */
export interface PendingApprovalInfo {
  readonly approvalId: string;
  readonly toolName: string;
  readonly arguments: Record<string, unknown>;
  readonly riskLevel: string;
}

/**
 * Result returned after executing a single cycle of the agent loop.
 */
export interface AgentStepResult {
  /** 1-based index of the completed step */
  readonly stepIndex: number;

  /** Lifecycle outcome governing next loop action */
  readonly outcome: StepOutcome;

  /** The assistant response message produced during this step */
  readonly assistantMessage?: AIMessage;

  /** Array of tool execution outcomes captured during this step */
  readonly toolResults: readonly ToolResult[];

  /** Present if outcome is WAITING_FOR_APPROVAL */
  readonly pendingApproval?: PendingApprovalInfo;

  /** Error message if outcome is ERROR or halted due to limits */
  readonly error?: string;
}
