/**
 * @file packages/core/src/tools/tool-call.schema.ts
 * @description Invariant data shape representing an intended or in-flight tool call.
 */

import { z } from "zod";
import { ToolCallIdSchema } from "@/identifiers";

/**
 * Validated tool call invocation payload.
 */
export const ToolCallSchema = z
  .object({
    callId: ToolCallIdSchema,
    toolName: z.string().min(1).describe("Target name of the registered tool"),
    arguments: z
      .record(z.string(), z.unknown())
      .describe("Parsed arguments dictionary passed to the tool"),
    timestamp: z.date().default(() => new Date()),
  })
  .describe("Tool call invocation dispatched by an agent");

export type ToolCall = z.infer<typeof ToolCallSchema>;
