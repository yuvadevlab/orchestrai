/**
 * @file apps/gateway/src/validation/approval.schema.ts
 * @description Inbound request validation schemas for human-in-the-loop approval tickets.
 */

import { z } from "zod";
import { ApprovalStatus } from "@orchestrai/shared-types";

/**
 * Validates operator decision payload to resolve a pending approval request.
 */
export const ResolveApprovalSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "CANCELLED"]).describe("Operator resolution verdict"),
  reason: z.string().max(500).optional().describe("Operator rationale or rejection notes"),
  modifiedArguments: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Optional operator modifications to proposed tool arguments"),
});

export type ResolveApprovalDto = z.infer<typeof ResolveApprovalSchema>;

/**
 * Validates query parameters for filtering approval requests.
 */
export const ApprovalFilterSchema = z.object({
  executionId: z.uuid().optional().describe("Filter by execution run"),
  status: z.nativeEnum(ApprovalStatus).optional().describe("Filter by ticket status"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export type ApprovalFilterDto = z.infer<typeof ApprovalFilterSchema>;
