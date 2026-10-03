/**
 * @file apps/gateway/src/services/live-execution.manager.ts
 * @description Coordinates real-time LLM streaming, tool execution, and HITL permission gates.
 * @module apps/gateway/services
 */

import { EventEmitter } from "node:events";
import {
  ExecutionStatus,
  SseStreamEvent,
  AgentMode,
  FeatureFlagKey,
  CognitivePolicySlug,
} from "@orchestrai/shared-types";
import { autoDetectMode } from "@orchestrai/agent";
import type { GatewayResponse } from "@/routes/http-types";
import {
  attachExecutionSseStream,
  type ExecutionStreamState,
} from "@/modules/streaming/live-execution-broadcaster";
import { liveExecutionRedisPublisher } from "@/modules/streaming/live-execution-redis-publisher";
import { buildInitialConversationHistory } from "@/modules/streaming/live-message-history";
import { executeAutonomousTurns } from "@/modules/streaming/live-turn-executor";
import { memoryService } from "@/modules/memory/memory.service";
import { ragService } from "@/modules/rag/rag.service";
import { checkSemanticCache, storeSemanticCache } from "@/modules/cache/semantic-cache.service";
import { featureFlagService } from "@/modules/platform/services/feature-flag.service";
import { cognitivePolicyService } from "@/modules/platform/services/cognitive-policy.service";

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
   * @param mode - Operational autonomy mode (CHAT, PLAN, ACT, AUTO)
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
    mode?: AgentMode,
  ): Promise<void> {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const selectedModel =
      modelName ||
      process.env.DEFAULT_MODEL_NAME ||
      (() => {
        throw new Error("No model specified and DEFAULT_MODEL_NAME is not configured");
      })();
    const sessionId = conversationId || executionId;

    // Automatically detect operational mode when AUTO or omitted
    const effectiveMode =
      mode && mode !== AgentMode.AUTO ? mode : autoDetectMode(inputPrompt, AgentMode.ACT);

    const state: ExecutionStreamState = {
      executionId,
      chunks: [],
      fullOutput: "",
      artifacts: [],
      status: ExecutionStatus.RUNNING,
    };
    this.states.set(executionId, state);

    // Check semantic vector cache for identical or near-duplicate queries
    const cachedResponse = await checkSemanticCache(inputPrompt);
    if (cachedResponse) {
      state.chunks.push(cachedResponse);
      state.fullOutput = cachedResponse;
      state.status = ExecutionStatus.COMPLETED;
      state.completedAt = new Date().toISOString();
      this.emitEvent(executionId, SseStreamEvent.CHUNK, cachedResponse);
      this.emitEvent(executionId, SseStreamEvent.DONE, cachedResponse);
      return;
    }

    // Recall cross-session episodic & semantic memories using tenant partition
    const memoryContext = await memoryService.recallContext(inputPrompt, tenantId ?? "default");

    // Auto-inject top-3 relevant knowledge base documents via RAG
    let ragContext = "";
    try {
      const ragResult = await ragService.query(
        { query: inputPrompt, limit: 3, minScore: 0.35, alpha: 0.5 },
        tenantId ?? "default",
      );
      if (ragResult.context) {
        ragContext = `\n\n[Knowledge Base Context]:\n${ragResult.context}`;
      }
    } catch {
      // Non-critical: continue without knowledge base documents
    }

    // Maintenance mode circuit breaker check
    const isMaintenance = await featureFlagService.isEnabled(
      FeatureFlagKey.MAINTENANCE_MODE,
      false,
    );
    if (isMaintenance) {
      const maintenanceState: ExecutionStreamState = {
        executionId,
        chunks: [],
        fullOutput: "",
        artifacts: [],
        status: ExecutionStatus.FAILED,
      };
      this.states.set(executionId, maintenanceState);
      this.emitEvent(
        executionId,
        SseStreamEvent.ERROR,
        "System is currently in maintenance mode. Please try again later.",
      );
      return;
    }

    // Resolve dynamic cognitive policy from database
    const policySlug =
      effectiveMode === AgentMode.PLAN
        ? CognitivePolicySlug.DEEP_REASONING
        : effectiveMode === AgentMode.CHAT
          ? CognitivePolicySlug.FAST_CHAT
          : CognitivePolicySlug.AUTONOMOUS_ACT;

    const policy = await cognitivePolicyService.getPolicy(policySlug);
    const thinkingGuidelines =
      policy?.enableThinking && policy.thinkingGuidelines
        ? `\n\n[Cognitive Thinking Guidelines]:\n${policy.thinkingGuidelines}`
        : "";

    const resolvedMaxSteps = maxSteps ?? policy?.maxExecutionSteps;
    const resolvedTemperature = policy?.temperature;

    const augmentedSystemPrompt = [systemPrompt, memoryContext, ragContext, thinkingGuidelines]
      .filter(Boolean)
      .join("\n\n");

    const conversationHistory = buildInitialConversationHistory(
      inputPrompt,
      personaRole,
      augmentedSystemPrompt || undefined,
      history,
      effectiveMode,
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
      resolvedMaxSteps,
      tenantId,
      agentId,
      contextWindow,
      costPerTokenUsd,
      resolvedTemperature,
    );

    // Cache successful execution output for semantic query deduplication
    if (state.status === ExecutionStatus.COMPLETED && state.fullOutput) {
      void storeSemanticCache(inputPrompt, state.fullOutput);
    }
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
