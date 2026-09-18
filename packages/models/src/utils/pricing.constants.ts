/**
 * @file packages/models/src/utils/pricing.constants.ts
 * @description Hardcoded per-token pricing rates for supported LLM providers.
 *
 * ─── Why hardcoded? (Learning note) ──────────────────────────────────────────
 * Pricing configs loaded from a database or API introduce I/O latency and
 * failure modes into every cost estimate call. Since pricing changes infrequently
 * (usually quarterly), constants are the right trade-off for now.
 * When pricing changes: update these constants and bump the package version.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Prices are in USD per 1,000 tokens (millicents per token * 10).
 * Source: Provider pricing pages as of 2025-09.
 * Local models (Ollama) have zero cost.
 */

import type { ModelProvider } from "@orchestrai/core";

/**
 * Per-model token pricing configuration.
 * Both prompt and completion prices are in USD per 1,000 tokens.
 */
export interface TokenPricingConfig {
  /** Cost per 1,000 prompt (input) tokens in USD */
  readonly promptPer1kUsd: number;
  /** Cost per 1,000 completion (output) tokens in USD */
  readonly completionPer1kUsd: number;
}

/**
 * Pricing registry keyed by `"provider/modelName"`.
 * Add new models here when pricing is needed for cost tracking.
 *
 * Design note: We use a plain Record rather than a Map because this data
 * is static and known at compile time — a Map would add runtime overhead
 * with no benefit for a static lookup table.
 */
export const MODEL_PRICING: Readonly<Record<string, TokenPricingConfig>> = {
  // ── Ollama (local) ─────────────────────────────────────────────────────────
  // All local models are free — cost is only hardware/electricity
  "ollama/qwen2.5:7b": { promptPer1kUsd: 0, completionPer1kUsd: 0 },
  "ollama/llama3.2:3b": { promptPer1kUsd: 0, completionPer1kUsd: 0 },
  "ollama/mistral:7b": { promptPer1kUsd: 0, completionPer1kUsd: 0 },
  "ollama/deepseek-r1:7b": { promptPer1kUsd: 0, completionPer1kUsd: 0 },

  // ── OpenAI ─────────────────────────────────────────────────────────────────
  "openai/gpt-4o": { promptPer1kUsd: 0.005, completionPer1kUsd: 0.015 },
  "openai/gpt-4o-mini": { promptPer1kUsd: 0.00015, completionPer1kUsd: 0.0006 },
  "openai/gpt-4-turbo": { promptPer1kUsd: 0.01, completionPer1kUsd: 0.03 },
  "openai/o1": { promptPer1kUsd: 0.015, completionPer1kUsd: 0.06 },
  "openai/o1-mini": { promptPer1kUsd: 0.003, completionPer1kUsd: 0.012 },

  // ── Anthropic ──────────────────────────────────────────────────────────────
  "anthropic/claude-3-5-sonnet-20241022": { promptPer1kUsd: 0.003, completionPer1kUsd: 0.015 },
  "anthropic/claude-3-5-haiku-20241022": { promptPer1kUsd: 0.0008, completionPer1kUsd: 0.004 },
  "anthropic/claude-3-opus-20240229": { promptPer1kUsd: 0.015, completionPer1kUsd: 0.075 },
};

/**
 * Resolves pricing config for a given provider + model name.
 * Falls back to zero-cost config if the model is not in the registry,
 * so unconfigured models don't crash cost estimation.
 *
 * @param provider - ModelProvider enum value
 * @param modelName - Provider model name string
 * @returns TokenPricingConfig (zero cost if model is unknown)
 */
export function resolvePricing(provider: ModelProvider, modelName: string): TokenPricingConfig {
  const key = `${provider}/${modelName}`;
  // Fall back to zero-cost rather than throwing — unknown models shouldn't
  // block execution, they just won't have accurate cost tracking
  return MODEL_PRICING[key] ?? { promptPer1kUsd: 0, completionPer1kUsd: 0 };
}
