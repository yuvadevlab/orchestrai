/**
 * @file apps/gateway/src/modules/streaming/live-turn-terminal.ts
 * @description Manages terminal state transitions, episodic memory recording, and domain event publishing for live executions.
 * @module apps/gateway/modules/streaming
 */

import { ExecutionStatus, EpisodeOutcome, SseStreamEvent } from "@orchestrai/shared-types";
import { StatusCode, type Span } from "@orchestrai/observability";
import { memoryService } from "@/modules/memory/memory.service";
import type { ExecutionStreamState } from "@/modules/streaming/live-execution-broadcaster";
import type { TurnExecutorCallbacks } from "@/modules/streaming/live-turn-executor";
import {
  publishExecutionCompleted,
  publishExecutionFailed,
} from "@/modules/events/domain-event-publisher";

/**
 * Parameters for finalizing a successful execution.
 */
export interface TerminalSuccessParams {
  readonly executionId: string;
  readonly tenantId: string;
  readonly agentId: string;
  readonly inputPrompt: string;
  readonly state: ExecutionStreamState;
  readonly callbacks: TurnExecutorCallbacks;
  readonly rootSpan: Span;
  readonly toolsCalled: Set<string>;
  readonly totalPromptTokens: number;
  readonly totalCompletionTokens: number;
  readonly startTime: number;
}

/**
 * Finalizes execution state as COMPLETED, emits SSE DONE, publishes domain events,
 * and records the execution episode in long-term episodic memory.
 */
export function handleExecutionSuccess(params: TerminalSuccessParams): void {
  const {
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
  } = params;

  const durationMs = Date.now() - startTime;
  state.status = ExecutionStatus.COMPLETED;
  state.completedAt = new Date().toISOString();
  rootSpan.end();
  callbacks.emitEvent(SseStreamEvent.DONE, state.fullOutput);

  // Publish EXECUTION_COMPLETED domain event — triggers billing, memory distillation, eval
  publishExecutionCompleted(
    executionId as never,
    tenantId as never,
    toolsCalled.size,
    totalPromptTokens + totalCompletionTokens,
    durationMs,
    state.fullOutput.slice(0, 2000),
  );

  // Record episodic memory for cross-session recall
  void memoryService.recordExecutionEpisode({
    executionId,
    tenantId,
    agentId,
    goal: inputPrompt,
    summary: state.fullOutput.slice(0, 500) || "Executed turn sequence",
    outcome: EpisodeOutcome.SUCCESS,
    toolsUsed: Array.from(toolsCalled),
    durationMs,
  });
}

/**
 * Parameters for finalizing a failed execution.
 */
export interface TerminalFailureParams {
  readonly executionId: string;
  readonly tenantId: string;
  readonly agentId: string;
  readonly inputPrompt: string;
  readonly state: ExecutionStreamState;
  readonly callbacks: TurnExecutorCallbacks;
  readonly rootSpan: Span;
  readonly toolsCalled: Set<string>;
  readonly startTime: number;
  readonly error: unknown;
}

/**
 * Finalizes execution state as FAILED, emits SSE ERROR, publishes domain events,
 * and records the failure episode in long-term episodic memory.
 */
export function handleExecutionFailure(params: TerminalFailureParams): void {
  const {
    executionId,
    tenantId,
    agentId,
    inputPrompt,
    state,
    callbacks,
    rootSpan,
    toolsCalled,
    startTime,
    error,
  } = params;

  const errMsg = error instanceof Error ? error.message : String(error);
  const durationMs = Date.now() - startTime;
  state.status = ExecutionStatus.FAILED;
  state.error = errMsg;
  state.completedAt = new Date().toISOString();
  rootSpan.setStatus(StatusCode.ERROR, errMsg);
  rootSpan.end();
  callbacks.emitEvent(SseStreamEvent.ERROR, errMsg);

  // Publish EXECUTION_FAILED domain event — triggers error trace + failure episode record
  publishExecutionFailed(executionId as never, tenantId as never, errMsg);

  // Record failure episode for reflective learning
  void memoryService.recordExecutionEpisode({
    executionId,
    tenantId,
    agentId,
    goal: inputPrompt,
    summary: `Failed with error: ${errMsg}`,
    outcome: EpisodeOutcome.FAILURE,
    toolsUsed: Array.from(toolsCalled),
    durationMs,
  });
}
