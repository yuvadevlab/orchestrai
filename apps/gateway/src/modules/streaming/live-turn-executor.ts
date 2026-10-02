/**
 * @file apps/gateway/src/modules/streaming/live-turn-executor.ts
 * @description Coordinates autonomous multi-turn LLM reasoning, tools, memory, and observability.
 * @module apps/gateway/modules/streaming
 */

import { ExecutionStatus, SseStreamEvent } from "@orchestrai/shared-types";
import { createModelResiliencePipeline } from "@orchestrai/resilience";
import { OllamaAdapter } from "@orchestrai/models";
import { extractToolCall } from "@/modules/streaming/autonomous-agent-runner";
import { traceService } from "@/modules/trace/trace.service";
import type { ExecutionStreamState } from "@/modules/streaming/live-execution-broadcaster";
import type { LiveMessage } from "@/modules/streaming/live-message-history";
import {
  checkBudgetAllowed,
  countMessageTokens,
  recordTurnCost,
} from "@/modules/billing/billing.service";
import { publishExecutionStarted } from "@/modules/events/domain-event-publisher";
import {
  ABSOLUTE_MAX_TURNS,
  DEFAULT_CONTEXT_WINDOW,
  shouldCompact,
  emitCompactionNotice,
} from "@/modules/streaming/live-turn-compaction";
import { executeTurnToolStep } from "@/modules/streaming/live-turn-tool-step";
import {
  handleExecutionSuccess,
  handleExecutionFailure,
} from "@/modules/streaming/live-turn-terminal";

export { ABSOLUTE_MAX_TURNS, DEFAULT_CONTEXT_WINDOW };

export interface TurnExecutorCallbacks {
  readonly emitEvent: (event: SseStreamEvent | string, data: unknown) => void;
}

/**
 * Executes multi-turn reasoning loop with streaming LLM, tools, billing, events, and resilience.
 *
 * @param executionId - Unique execution identifier
 * @param inputPrompt - Original user instruction for this execution
 * @param selectedModel - Ollama model name chosen for this agent
 * @param host - Ollama server URL
 * @param sessionId - Session identifier for approval routing
 * @param history - Initial conversation message history (system prompt + prior turns)
 * @param state - Mutable execution stream state shared with broadcaster
 * @param callbacks - SSE event emitter callbacks
 * @param maxTurns - Max autonomous turns from DB agent record (clamped to ABSOLUTE_MAX_TURNS)
 * @param tenantId - Tenant partition for billing and memory
 * @param agentId - Agent DB identifier for episode recording
 * @param contextWindow - Model context window from DB model record (used for compaction trigger)
 * @param costPerTokenUsd - Cost per token from DB model record (0 for local Ollama)
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
  maxTurns: number = ABSOLUTE_MAX_TURNS,
  tenantId = "default",
  agentId = "lead-orchestrator",
  contextWindow: number = DEFAULT_CONTEXT_WINDOW,
  costPerTokenUsd = 0,
): Promise<void> {
  const tracer = traceService.tracer;
  const rootSpan = tracer.startSpan("agent.execution", {
    attributes: { "execution.id": executionId, "model.name": selectedModel },
  });
  const startTime = Date.now();
  const toolsCalled = new Set<string>();
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  // Resilience pipeline for every Ollama call: circuit breaker, retry, timeout, bulkhead
  const resilience = createModelResiliencePipeline<string>({
    modelName: selectedModel,
    timeoutMs: 120_000,
    maxRetries: 2,
    maxConcurrency: 8,
    failureThreshold: 5,
    cooldownMs: 15_000,
  });

  try {
    const adapter = await OllamaAdapter.create({
      host,
      timeoutMs: 120_000,
      defaultModel: selectedModel,
    });

    // Clamp maxTurns between 1 and the absolute ceiling to prevent misconfigured runaway loops
    const effectiveMaxTurns = Math.min(Math.max(1, maxTurns), ABSOLUTE_MAX_TURNS);

    // Emit EXECUTION_STARTED domain event — triggers Inspector Rail initialization
    publishExecutionStarted(executionId as never, agentId, tenantId as never);

    for (let turn = 0; turn < effectiveMaxTurns; turn++) {
      // Cancellation check at start of every turn
      if (state.status === ExecutionStatus.CANCELLED) break;

      // Budget gate: block the turn if tenant has exceeded their spending quota
      const estimatedPromptTokens = countMessageTokens(history);
      if (!checkBudgetAllowed(tenantId, estimatedPromptTokens, costPerTokenUsd)) {
        callbacks.emitEvent(SseStreamEvent.ERROR, "Execution halted: token budget exhausted");
        break;
      }

      // Context compaction warning: notify UI when window is approaching threshold
      if (shouldCompact(history, contextWindow)) {
        emitCompactionNotice(executionId, history, contextWindow, callbacks);
      }

      const turnSpan = tracer.startSpan(`agent.turn_${turn + 1}`, {
        parentSpanId: rootSpan.spanContext().spanId,
        attributes: { "execution.id": executionId, "turn.index": turn + 1 },
      });

      // Stream LLM response wrapped in resilience pipeline
      const turnOutput = await resilience.execute(async () => {
        const stream = adapter.stream({
          model: selectedModel,
          messages: history,
          temperature: 0.7,
          stream: true,
        });

        let output = "";
        for await (const chunk of stream) {
          if (chunk.delta) {
            output += chunk.delta;
            state.chunks.push(chunk.delta);
            state.fullOutput += chunk.delta;
            callbacks.emitEvent(SseStreamEvent.CHUNK, chunk.delta);
          }
        }
        return output;
      });

      turnSpan.end();

      // Record token consumption and update ledger
      const promptTokens = countMessageTokens(history);
      const completionTokens = Math.ceil((turnOutput.length ?? 0) / 4);
      totalPromptTokens += promptTokens;
      totalCompletionTokens += completionTokens;
      recordTurnCost(tenantId, executionId, selectedModel, promptTokens, completionTokens);

      const rawToolCall = extractToolCall(turnOutput);
      // If model produced final text answer without invoking another tool, terminate turn loop
      if (!rawToolCall) break;

      const proceeded = await executeTurnToolStep({
        executionId,
        sessionId,
        tenantId,
        rawToolCall,
        turnOutput,
        history,
        state,
        callbacks,
        toolsCalled,
      });

      if (!proceeded) break;
    }

    handleExecutionSuccess({
      executionId,
      tenantId,
      agentId,
      inputPrompt,
      state,
      callbacks,
      rootSpan,
      toolsCalled,
      totalPromptTokens,
      totalCompletionTokens,
      startTime,
    });
  } catch (err: unknown) {
    handleExecutionFailure({
      executionId,
      tenantId,
      agentId,
      inputPrompt,
      state,
      callbacks,
      rootSpan,
      toolsCalled,
      startTime,
      error: err,
    });
  }
}
