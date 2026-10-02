/**
 * @file apps/gateway/src/services/live-execution.manager.ts
 * @description Coordinates real-time LLM streaming, tool execution, and HITL permission gates.
 * @module apps/gateway/services
 */

import { EventEmitter } from "node:events";
import { ExecutionStatus, SseStreamEvent } from "@orchestrai/shared-types";
import type { GatewayResponse } from "@/routes/http-types";
import {
  attachExecutionSseStream,
  type ExecutionStreamState,
} from "@/modules/streaming/live-execution-broadcaster";
import { liveExecutionRedisPublisher } from "@/modules/streaming/live-execution-redis-publisher";
import { buildInitialConversationHistory } from "@/modules/streaming/live-message-history";
import { executeAutonomousTurns } from "@/modules/streaming/live-turn-executor";
import { memoryService } from "@/modules/memory/memory.service";

export type { ExecutionStreamState };

/**
 * LiveExecutionManager coordinates multi-turn LLM streaming and HITL permission gates to SSE listeners.
 */
class LiveExecutionManager {
  private readonly states = new Map<string, ExecutionStreamState>();
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  private emitEvent(executionId: string, event: SseStreamEvent | string, data: unknown): void {
    this.emitter.emit(`${event}:${executionId}`, data);
    liveExecutionRedisPublisher.publish(
      executionId,
      event === SseStreamEvent.CHUNK ? SseStreamEvent.MESSAGE : event,
      data,
    );
  }

  public getState(executionId: string): ExecutionStreamState | undefined {
    return this.states.get(executionId);
  }

  /**
   * Starts autonomous execution with memory recall, conversation history, and live tool execution.
   *
   * @param executionId - Unique execution identifier
   * @param inputPrompt - User prompt instruction
   * @param modelName - Selected model identifier
   * @param systemPrompt - Caller/DB system prompt
   * @param conversationId - Session/conversation identifier
   * @param history - Prior conversation turns
   * @param maxSteps - Maximum autonomous turns allowed
   * @param tenantId - Tenant identifier partition
   * @param agentId - Executing agent identifier
   * @param contextWindow - Model context window size in tokens
   * @param costPerTokenUsd - Cost per token from model record
   * @param personaRole - Agent persona role (e.g., developer, researcher)
   */
  public async startExecution(
    executionId: string,
    inputPrompt: string,
    modelName?: string,
    systemPrompt?: string,
    conversationId?: string,
    history?: Array<{ role: string; content: string }>,
    maxSteps?: number,
    tenantId?: string,
    agentId?: string,
    contextWindow?: number,
    costPerTokenUsd?: number,
    personaRole?: string,
  ): Promise<void> {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const selectedModel = modelName || process.env.DEFAULT_MODEL_NAME || "gemma4:31b-cloud";
    const sessionId = conversationId || executionId;

    const state: ExecutionStreamState = {
      executionId,
      chunks: [],
      fullOutput: "",
      artifacts: [],
      status: ExecutionStatus.RUNNING,
    };
    this.states.set(executionId, state);

    // Recall cross-session episodic & semantic memories using tenant partition
    const memoryContext = await memoryService.recallContext(inputPrompt, tenantId ?? "default");
    const augmentedSystemPrompt = [systemPrompt, memoryContext].filter(Boolean).join("\n\n");

    const conversationHistory = buildInitialConversationHistory(
      inputPrompt,
      personaRole,
      augmentedSystemPrompt || undefined,
      history,
    );

    await executeAutonomousTurns(
      executionId,
      inputPrompt,
      selectedModel,
      host,
      sessionId,
      conversationHistory,
      state,
      {
        emitEvent: (event, data) => this.emitEvent(executionId, event, data),
      },
      maxSteps,
      tenantId,
      agentId,
      contextWindow,
      costPerTokenUsd,
    );
  }

  /**
   * Signals a running execution to cancel after the current turn completes.
   * The turn loop checks state.status at the start of each iteration.
   */
  public cancelExecution(executionId: string): void {
    const state = this.states.get(executionId);
    if (state && state.status === ExecutionStatus.RUNNING) {
      state.status = ExecutionStatus.CANCELLED;
      this.emitEvent(executionId, SseStreamEvent.DONE, "[CANCELLED]");
    }
  }

  public attachSseStream(executionId: string, res: GatewayResponse): void {
    const state = this.states.get(executionId);
    attachExecutionSseStream(executionId, state, this.emitter, res);
  }
}

export const liveExecutionManager = new LiveExecutionManager();
