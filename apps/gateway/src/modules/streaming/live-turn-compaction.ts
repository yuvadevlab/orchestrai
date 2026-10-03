/**
 * @file apps/gateway/src/modules/streaming/live-turn-compaction.ts
 * @description Manages context threshold evaluation, token limits, and compaction notices for live turns.
 * Dynamically driven by database platform configuration with fallback bounds.
 * @module apps/gateway/modules/streaming
 */

import { countMessageTokens } from "@/modules/billing/billing.service";
import type { LiveMessage } from "@/modules/streaming/live-message-history";
import type { TurnExecutorCallbacks } from "@/modules/streaming/live-turn-executor";
import { platformConfigService } from "@/modules/platform/services/platform-config.service";

/**
 * Absolute safety ceiling for autonomous turn loops.
 * Sourced from AGENT_MAX_TURNS env — configure per-deployment, never in code.
 * Falls back to 20 if env is absent or invalid.
 */
export const ABSOLUTE_MAX_TURNS = Math.max(
  1,
  parseInt(process.env.AGENT_MAX_TURNS ?? "20", 10) || 20,
);

/**
 * Safe fallback context window size when the DB model record does not specify one.
 * Sourced from MODEL_DEFAULT_CONTEXT_WINDOW env.
 * Falls back to 8192 (minimum safe value for most 7B+ Ollama models).
 */
export const DEFAULT_CONTEXT_WINDOW = Math.max(
  1024,
  parseInt(process.env.MODEL_DEFAULT_CONTEXT_WINDOW ?? "8192", 10) || 8192,
);

/**
 * Fraction of the context window at which compaction is triggered.
 * Default 0.75 leaves 25% room for the next LLM response + tool result.
 */
export const COMPACTION_THRESHOLD_RATIO = Math.min(
  0.95,
  Math.max(0.5, parseFloat(process.env.CONTEXT_COMPACTION_THRESHOLD ?? "0.75") || 0.75),
);

/**
 * Checks whether the current message history exceeds the compaction threshold.
 * Resolves compaction threshold dynamically from database platform configuration.
 *
 * @param history - Current conversation history
 * @param contextWindow - Model context window size sourced from the DB model record
 * @param customRatio - Optional explicit threshold override
 * @returns true if compaction should be triggered
 */
export async function shouldCompact(
  history: LiveMessage[],
  contextWindow: number,
  customRatio?: number,
): Promise<boolean> {
  const tokenCount = countMessageTokens(history);
  let ratio = customRatio;

  if (typeof ratio !== "number") {
    try {
      const config = await platformConfigService.getCompactionConfig();
      ratio = config.thresholdRatio;
    } catch {
      ratio = COMPACTION_THRESHOLD_RATIO;
    }
  }

  // Trigger at configured ratio (default 75%) to leave room for the next response + tool result
  return tokenCount > contextWindow * ratio;
}

/**
 * Emits a CONTEXT_COMPACT event so the Inspector Rail shows the compaction notice.
 *
 * @param executionId - Current execution identifier
 * @param history - Current conversation history
 * @param contextWindow - Model context window from DB record
 * @param callbacks - SSE callback emitter
 */
export function emitCompactionNotice(
  executionId: string,
  history: LiveMessage[],
  contextWindow: number,
  callbacks: TurnExecutorCallbacks,
): void {
  const tokenCount = countMessageTokens(history);
  callbacks.emitEvent("CONTEXT_COMPACT", {
    executionId,
    tokenCount,
    contextWindow,
    utilizationPct: Math.round((tokenCount / contextWindow) * 100),
  });
}
