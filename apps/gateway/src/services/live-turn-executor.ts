/**
 * @file apps/gateway/src/services/live-turn-executor.ts
 * @description Coordinates autonomous multi-turn LLM reasoning, tools, memory, and observability.
 * @module apps/gateway/services
 */

import { randomUUID } from "node:crypto";
import { OllamaAdapter } from "@orchestrai/models";
import {
  MessageRole,
  ExecutionStatus,
  EpisodeOutcome,
  SseStreamEvent,
} from "@orchestrai/shared-types";
import { StatusCode } from "@orchestrai/observability";
import { extractToolCall, formatToolArtifact } from "./autonomous-agent-runner";
import { memoryService } from "./memory.service";
import { traceService } from "./trace.service";
import type { ExecutionStreamState } from "./live-execution-broadcaster";
import type { LiveMessage } from "./live-message-history";

const MAX_AUTONOMOUS_TURNS = 5;

export interface TurnExecutorCallbacks {
  readonly emitEvent: (event: SseStreamEvent | string, data: unknown) => void;
}

import { handleToolInvocationWithApproval } from "./tool-approval-invoker";

/**
 * Executes multi-turn reasoning loop with streaming LLM, tools, and telemetry.
 */
export async function executeAutonomousTurns(
  executionId: string,
  inputPrompt: string,
  selectedModel: string,
  host: string,
  sessionId: string,
  history: LiveMessage[],
  state: ExecutionStreamState,
  callbacks: TurnExecutorCallbacks,
): Promise<void> {
  const tracer = traceService.tracer;
  const rootSpan = tracer.startSpan("agent.execution", {
    attributes: { "execution.id": executionId, "model.name": selectedModel },
  });
  const startTime = Date.now();
  const toolsCalled = new Set<string>();

  try {
    const adapter = await OllamaAdapter.create({
      host,
      timeoutMs: 120000,
      defaultModel: selectedModel,
    });

    for (let turn = 0; turn < MAX_AUTONOMOUS_TURNS; turn++) {
      const turnSpan = tracer.startSpan(`agent.turn_${turn + 1}`, {
        parentSpanId: rootSpan.spanContext().spanId,
        attributes: { "execution.id": executionId, "turn.index": turn + 1 },
      });

      const stream = adapter.stream({
        model: selectedModel,
        messages: history,
        temperature: 0.7,
        stream: true,
      });

      let turnOutput = "";
      for await (const chunk of stream) {
        if (chunk.delta) {
          turnOutput += chunk.delta;
          state.chunks.push(chunk.delta);
          state.fullOutput += chunk.delta;
          callbacks.emitEvent(SseStreamEvent.CHUNK, chunk.delta);
        }
      }

      turnSpan.end();

      const toolCall = extractToolCall(turnOutput);
      if (!toolCall) break;

      toolsCalled.add(toolCall.tool);
      callbacks.emitEvent(SseStreamEvent.TOOL_CALL, toolCall);

      const toolResult = await handleToolInvocationWithApproval(
        executionId,
        sessionId,
        toolCall,
        state,
        callbacks.emitEvent,
      );

      const artifact = formatToolArtifact(toolCall.tool, toolCall.args, toolResult);
      state.artifacts.push(artifact);
      callbacks.emitEvent(SseStreamEvent.ARTIFACT, artifact);

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

      history.push({
        id: randomUUID(),
        role: MessageRole.USER,
        content: `[Tool Result for "${toolCall.tool}"]:\n${feedback}\n\nPlease proceed.`,
        metadata: {},
        createdAt: new Date(),
      });
    }

    state.status = ExecutionStatus.COMPLETED;
    state.completedAt = new Date().toISOString();
    rootSpan.end();
    callbacks.emitEvent(SseStreamEvent.DONE, state.fullOutput);

    // Record learning episode into cross-session memory
    void memoryService.recordExecutionEpisode({
      executionId,
      tenantId: "default",
      agentId: "lead-orchestrator",
      goal: inputPrompt,
      summary: state.fullOutput.slice(0, 500) || "Executed turn sequence",
      outcome: EpisodeOutcome.SUCCESS,
      toolsUsed: Array.from(toolsCalled),
      durationMs: Date.now() - startTime,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    state.status = ExecutionStatus.FAILED;
    state.error = errMsg;
    state.completedAt = new Date().toISOString();
    rootSpan.setStatus(StatusCode.ERROR, errMsg);
    rootSpan.end();
    callbacks.emitEvent(SseStreamEvent.ERROR, errMsg);

    void memoryService.recordExecutionEpisode({
      executionId,
      tenantId: "default",
      agentId: "lead-orchestrator",
      goal: inputPrompt,
      summary: `Failed with error: ${errMsg}`,
      outcome: EpisodeOutcome.FAILURE,
      toolsUsed: Array.from(toolsCalled),
      durationMs: Date.now() - startTime,
    });
  }
}
