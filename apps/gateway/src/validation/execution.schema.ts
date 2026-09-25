/**
 * @file apps/gateway/src/validation/execution.schema.ts
 * @description Inbound request validation schemas for execution lifecycles and control.
 */

import { z } from "zod";
import { AgentMode, ExecutionStatus } from "@orchestrai/shared-types";

/**
 * Validates payload for launching a new asynchronous agent execution.
 */
export const CreateExecutionSchema = z.object({
  agentId: z.uuid().optional().describe("Target agent ID configured in the workspace"),
  conversationId: z.uuid().optional().describe("Optional conversation session ID to link"),
  mode: z.enum(AgentMode).optional().default(AgentMode.AUTO).describe("Execution autonomy mode"),
  input: z
    .string()
    .min(1, "Execution input text must not be empty")
    .describe("Initial prompt or task description"),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      }),
    )
    .optional()
    .describe("Prior conversation history messages for multi-turn context"),
  variables: z
    .record(z.string(), z.unknown())
    .optional()
    .default({})
    .describe("Runtime template parameters"),
});

export type CreateExecutionDto = z.infer<typeof CreateExecutionSchema>;

/**
 * Validates query parameters for filtering and paginating executions.
 */
export const ExecutionFilterSchema = z.object({
  agentId: z.uuid().optional().describe("Filter by specific agent ID"),
  conversationId: z.uuid().optional().describe("Filter by conversation ID"),
  status: z.enum(ExecutionStatus).optional().describe("Filter by execution status"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Pagination size limit"),
  cursor: z.string().optional().describe("Opaque cursor for keyset pagination"),
});

export type ExecutionFilterDto = z.infer<typeof ExecutionFilterSchema>;

/**
 * Validates request payload when resuming a paused or approval-gated execution.
 */
export const ResumeExecutionSchema = z.object({
  action: z.enum(["RESUME", "RETRY"]).default("RESUME").describe("Resume directive"),
  feedback: z.string().optional().describe("Optional operator guidance provided on resume"),
});

export type ResumeExecutionDto = z.infer<typeof ResumeExecutionSchema>;
