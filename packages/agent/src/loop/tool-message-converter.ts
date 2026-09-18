/**
 * @file packages/agent/src/loop/tool-message-converter.ts
 * @description Helper functions converting between ToolResult objects and OrchestrAI AIMessages.
 */

import { MessageRole, ToolResultStatus } from "@orchestrai/shared-types";
import {
  AIMessageSchema,
  type AIMessage,
  type ToolCallContentBlock,
  type ToolResult,
} from "@orchestrai/core";

/**
 * Converts a ToolResult record into a canonical AIMessage for the LLM history.
 *
 * @param result - The execution outcome produced by ToolRunner.
 * @returns An AIMessage with role 'tool' and a 'tool_result' content block.
 */
export function createToolResultMessage(result: ToolResult): AIMessage {
  const isError = result.status === ToolResultStatus.ERROR;
  const payload = isError ? { error: result.error } : result.output;

  return AIMessageSchema.parse({
    role: MessageRole.TOOL,
    content: [
      {
        type: "tool_result",
        callId: result.callId,
        isError,
        output: payload,
      },
    ],
  });
}

/**
 * Extracts all tool_call blocks present in an assistant message.
 *
 * @param message - The assistant message returned by the model.
 * @returns Array of ToolCallContentBlock instances.
 */
export function extractToolCalls(message: AIMessage): ToolCallContentBlock[] {
  if (typeof message.content === "string") {
    return [];
  }

  return message.content.filter(
    (block): block is ToolCallContentBlock => block.type === "tool_call",
  );
}
