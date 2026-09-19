/**
 * @file packages/runtime/src/hitl/contracts/approval-ticket.types.ts
 * @description Invariant schemas and types for Human-in-the-Loop (HITL) approval tickets.
 */

import { z } from "zod";
import { ApprovalStatus } from "@orchestrai/shared-types";

/**
 * Operational risk classification assigned to a tool invocation requiring approval.
 */
export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/**
 * Immutable approval ticket recorded when an execution halts at an approval gate.
 */
export interface ApprovalTicket {
  /** Unique primary key UUID of this approval ticket */
  readonly approvalId: string;
  /** Execution run identifier associated with the ticket */
  readonly executionId: string;
  /** Optional step UUID within the execution run */
  readonly stepId?: string;
  /** Step index within the DAG execution traversal */
  readonly stepIndex: number;
  /** Identifier name of the tool awaiting operator clearance */
  readonly toolName: string;
  /** Original arguments proposed by the agent's LLM invocation */
  readonly toolArguments: Readonly<Record<string, unknown>>;
  /** Assessed operational risk level of the action */
  readonly riskLevel: RiskLevel;
  /** Agent's declared rationale justifying why the action is required */
  readonly rationale: string;
  /** Current processing state of the approval ticket */
  readonly status: ApprovalStatus;
  /** Identifier of the human operator or supervisor who reviewed the ticket */
  readonly operatorId?: string;
  /** Feedback or reason recorded if the ticket was rejected or cancelled */
  readonly rejectionReason?: string;
  /** Optional modified arguments supplied by the operator to sanitize the invocation */
  readonly modifiedArguments?: Readonly<Record<string, unknown>>;
  /** Timestamp when the approval requirement was generated */
  readonly requestedAt: Date;
  /** Hard deadline after which the ticket automatically transitions to TIMED_OUT */
  readonly expiresAt: Date;
  /** Timestamp when the human operator recorded their decision */
  readonly decidedAt?: Date;
}

/**
 * Payload submitted by a human operator resolving an active approval ticket.
 */
export const ApprovalResolutionInputSchema = z.object({
  /** Operator verdict: approval, refusal, or execution cancellation */
  decision: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
  /** Username or operator identity of the decision maker */
  operatorId: z.string().min(1),
  /** Optional justification or feedback explaining the verdict */
  reason: z.string().max(500).optional(),
  /** Optional operator modifications to the tool arguments before execution */
  modifiedArguments: z.record(z.string(), z.unknown()).optional(),
});

export type ApprovalResolutionInput = z.infer<typeof ApprovalResolutionInputSchema>;
