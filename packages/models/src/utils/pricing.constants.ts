/**
 * @file packages/models/src/utils/pricing.constants.ts
 * @description Dynamic token pricing configuration and fallback rate defaults.
 * Pricing rates are dynamically stored in and loaded from the database catalog (llm_models.defaultConfig).
 * @module @orchestrai/models/utils
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
 * Default zero-cost pricing config for local or unconfigured models.
 */
export const DEFAULT_TOKEN_PRICING: TokenPricingConfig = {
  promptPer1kUsd: 0,
  completionPer1kUsd: 0,
};

/**
 * Dynamic in-memory pricing cache keyed by "provider/modelIdentifier".
 * Dynamically registered at runtime when model records are queried from the database.
 */
const dynamicPricingStore = new Map<string, TokenPricingConfig>();

/**
 * Registers pricing rates dynamically from database records or API responses.
 *
 * @param provider - Provider identifier (e.g. "openai", "anthropic", "ollama")
 * @param modelIdentifier - Model identifier string
 * @param pricing - Pricing rates in USD per 1k tokens
 */
export function registerModelPricing(
  provider: string,
  modelIdentifier: string,
  pricing: TokenPricingConfig,
): void {
  const key = `${provider}/${modelIdentifier}`.toLowerCase();
  dynamicPricingStore.set(key, pricing);
}

/**
 * Resolves pricing config for a given provider + model name.
 * Uses dynamic registered pricing if present, or optional explicit override,
 * falling back to zero-cost config so unconfigured models don't crash cost estimation.
 *
 * @param provider - ModelProvider enum value or string
 * @param modelName - Provider model identifier string
 * @param explicitPricing - Optional explicit pricing override
 * @returns TokenPricingConfig (zero cost if model is unknown)
 */
export function resolvePricing(
  provider?: ModelProvider | string,
  modelName?: string,
  explicitPricing?: TokenPricingConfig,
): TokenPricingConfig {
  // 1. Honor explicit pricing override if provided by caller
  if (explicitPricing) {
    return explicitPricing;
  }

  // 2. If provider or model name is missing, fall back to default zero cost
  if (!provider || !modelName) {
    return DEFAULT_TOKEN_PRICING;
  }

  // 3. Look up dynamically registered pricing from database model catalog
  const key = `${provider}/${modelName}`.toLowerCase();
  return dynamicPricingStore.get(key) ?? DEFAULT_TOKEN_PRICING;
}
