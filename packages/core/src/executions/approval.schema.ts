/**
 * @file packages/core/src/executions/approval.schema.ts
 * @description Human-in-the-loop (HITL) approval request and decision schemas.
 */

import { z } from "zod";
import { ApprovalStatus } from "@orchestrai/shared-types";
import { ExecutionIdSchema, StepIdSchema, UuidSchema } from "@/identifiers";

/**
 * Status of a human approval requirement backed by ApprovalStatus enum.
 */
export const ApprovalStatusSchema = z
  .nativeEnum(ApprovalStatus)
  .describe("State of an approval request");

/**
 * Interactive approval request emitted when an agent requires authorization for a high-risk action.
 */
export const ApprovalRequestSchema = z
  .object({
    approvalId: UuidSchema.describe("Unique identifier for this approval ticket"),
    executionId: ExecutionIdSchema,
    stepId: StepIdSchema,
    toolName: z.string().min(1).describe("Target tool requiring operator clearance"),
    toolArguments: z
      .record(z.string(), z.unknown())
      .describe("Proposed arguments to be executed upon clearance"),
    rationale: z.string().min(1).describe("Agent's declared reason for requesting this action"),
    status: ApprovalStatusSchema.default(ApprovalStatus.PENDING),
    requestedAt: z.date().default(() => new Date()),
    expiresAt: z
      .date()
      .describe("Deadline after which the request automatically transitions to TIMED_OUT"),
  })
  .describe("Human approval request schema");

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

/**
 * Resolution payload submitted by the human operator or policy engine.
 */
export const ApprovalDecisionSchema = z
  .object({
    approvalId: UuidSchema,
    decision: z.enum(["APPROVED", "REJECTED"]).describe("Operator verdict"),
    decidedBy: z.string().min(1).describe("Identity or username of the approving operator"),
    reason: z.string().max(500).optional().describe("Optional feedback or rejection reason"),
    modifiedArguments: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Optional operator modifications to tool arguments before execution"),
    decidedAt: z.date().default(() => new Date()),
  })
  .describe("Operator decision resolving an active approval request");

export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
