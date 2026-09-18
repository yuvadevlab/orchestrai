/**
 * @file packages/core/src/tools/tool-result.schema.ts
 * @description Invariant data shape representing completed or failed tool outputs.
 */

import { z } from "zod";
import { ToolResultStatus } from "@orchestrai/shared-types";
import { ToolCallIdSchema } from "@/identifiers";

/**
 * Execution outcome status of a tool invocation backed by ToolResultStatus enum.
 */
export const ToolResultStatusSchema = z
  .nativeEnum(ToolResultStatus)
  .describe("Outcome status of the tool execution");

/**
 * Detailed output payload resulting from tool execution.
 */
export const ToolResultSchema = z
  .object({
    callId: ToolCallIdSchema,
    toolName: z.string().min(1).describe("Target tool name that was executed"),
    status: ToolResultStatusSchema,
    output: z.unknown().optional().describe("Serialized successful return payload"),
    error: z.string().optional().describe("Detailed error message if status is ERROR"),
    durationMs: z.number().nonnegative().describe("Total execution duration in milliseconds"),
    timestamp: z.date().default(() => new Date()),
  })
  .describe("Result payload captured after tool invocation finishes");

export type ToolResult = z.infer<typeof ToolResultSchema>;
