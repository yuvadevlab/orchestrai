/**
 * @file apps/gateway/src/modules/streaming/live-turn-tool-step.ts
 * @description Handles tool invocation, HITL approval, telemetry events, artifacts, and history injection for a live turn.
 * @module apps/gateway/modules/streaming
 */

import { randomUUID } from "node:crypto";
import { MessageRole, SseStreamEvent, ToolResultStatus } from "@orchestrai/shared-types";
import {
  formatToolArtifact,
  coerceWorkspaceTool,
} from "@/modules/streaming/autonomous-agent-runner";
import type { ExecutionStreamState } from "@/modules/streaming/live-execution-broadcaster";
import type { LiveMessage } from "@/modules/streaming/live-message-history";
import type { TurnExecutorCallbacks } from "@/modules/streaming/live-turn-executor";
import { handleToolInvocationWithApproval } from "@/modules/approval/tool-approval-invoker";
import { publishToolCalled, publishToolCompleted } from "@/modules/events/domain-event-publisher";

/**
 * Parameters for executing a tool invocation within an autonomous turn.
 */
export interface ExecuteToolStepParams {
  readonly executionId: string;
  readonly sessionId: string;
  readonly tenantId: string;
  readonly rawToolCall: { tool: string; args: Record<string, unknown> };
  readonly turnOutput: string;
  readonly history: LiveMessage[];
  readonly state: ExecutionStreamState;
  readonly callbacks: TurnExecutorCallbacks;
  readonly toolsCalled: Set<string>;
}

/**
 * Executes a tool step: validates tool, requests approval if needed, runs tool, emits SSE events,
 * publishes domain events, creates artifacts, and appends conversation turns to history.
 *
 * @param params - Execution context and dependencies
 * @returns true if tool execution proceeded normally, false if aborted due to unknown tool
 */
export async function executeTurnToolStep(params: ExecuteToolStepParams): Promise<boolean> {
  const {
    executionId,
    sessionId,
    tenantId,
    rawToolCall,
    turnOutput,
    history,
    state,
    callbacks,
    toolsCalled,
  } = params;

  // Coerce the untrusted model-output string to a canonical WorkspaceTool enum.
  // Unknown tools are skipped rather than dispatched — prevents silent runtime crashes.
  const canonicalTool = coerceWorkspaceTool(rawToolCall.tool);
  if (!canonicalTool) {
    callbacks.emitEvent(SseStreamEvent.ERROR, `Unknown tool: ${rawToolCall.tool}`);
    return false;
  }

  const toolCall = { tool: canonicalTool, args: rawToolCall.args };
  toolsCalled.add(canonicalTool);
  callbacks.emitEvent(SseStreamEvent.TOOL_CALL, toolCall);

  const callId = randomUUID();
  const toolStart = Date.now();

  // Publish TOOL_CALLED domain event — triggers observability trace span start
  publishToolCalled(
    executionId as never,
    callId,
    canonicalTool,
    rawToolCall.args,
    tenantId as never,
  );

  const toolResult = await handleToolInvocationWithApproval(
    executionId,
    sessionId,
    toolCall,
    state,
    callbacks.emitEvent,
  );

  const status = toolResult.isError ? ToolResultStatus.ERROR : ToolResultStatus.SUCCESS;
  const errorText = toolResult.isError
    ? typeof toolResult.output === "string"
      ? toolResult.output
      : JSON.stringify(toolResult.output)
    : undefined;

  // Publish TOOL_COMPLETED domain event — triggers trace span end + Inspector Rail update
  publishToolCompleted(
    executionId as never,
    callId,
    canonicalTool,
    status,
    Date.now() - toolStart,
    tenantId as never,
    toolResult.output,
    errorText,
  );

  const artifact = formatToolArtifact(canonicalTool, toolCall.args, toolResult);
  state.artifacts.push(artifact);
  callbacks.emitEvent(SseStreamEvent.ARTIFACT, artifact);

  // Append assistant output turn
  history.push({
    id: randomUUID(),
    role: MessageRole.ASSISTANT,
    content: turnOutput,
    metadata: {},
    createdAt: new Date(),
  });

  const feedback =
    typeof toolResult.output === "object"
      ? JSON.stringify(toolResult.output)
      : String(toolResult.output);

  // Append user tool observation turn back to the model
  history.push({
    id: randomUUID(),
    role: MessageRole.USER,
    content: `[Tool Result for "${canonicalTool}"]:\n${feedback}\n\nPlease proceed.`,
    metadata: {},
    createdAt: new Date(),
  });

  return true;
}
