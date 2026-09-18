/**
 * @file packages/models/src/utils/usage-aggregator.ts
 * @description Pure utility functions for token usage aggregation and cost estimation.
 *
 * ─── Pure functions (Learning note) ──────────────────────────────────────────
 * These functions are "pure" in the functional programming sense:
 *   - Same inputs → always same outputs (deterministic)
 *   - Zero side effects (no I/O, no mutation, no randomness)
 *
 * Why does this matter for AI engineering?
 * An agent execution may make 10+ LLM calls. You need to sum up all the token
 * usage at the end for billing and observability. A pure `mergeUsage()` function
 * can be called from a worker, a test, a webhook handler — anywhere — safely.
 * It's the foundation of reliable cost tracking.
 * ────────────────────────────────────────────────────────────────────────────
 */

import type { ModelUsage } from "@orchestrai/core";
import type { ModelProvider } from "@orchestrai/core";
import { resolvePricing, type TokenPricingConfig } from "./pricing.constants";

/**
 * Merges an array of ModelUsage records into a single aggregated usage summary.
 * Token counts are summed; cost is re-calculated from the summed totals.
 *
 * Use case: After a multi-step agent execution with several LLM calls, call
 * `mergeUsage(allStepUsages)` to produce the total usage for the entire run.
 *
 * @param usages - Array of individual ModelUsage records to aggregate.
 *                 Empty array returns a zero-usage record.
 * @returns Aggregated ModelUsage with summed token counts and costs
 *
 * @example
 * const total = mergeUsage([step1.usage, step2.usage, step3.usage]);
 * console.log(`Total tokens: ${total.totalTokens}, Cost: $${total.estimatedCostUsd}`);
 */
export function mergeUsage(usages: ModelUsage[]): ModelUsage {
  // Start with a zero accumulator — this handles the empty array case cleanly
  const initial: ModelUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
  };

  return usages.reduce<ModelUsage>((acc, usage) => {
    const promptTokens = acc.promptTokens + usage.promptTokens;
    const completionTokens = acc.completionTokens + usage.completionTokens;

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      // Sum the pre-calculated costs from each usage record
      estimatedCostUsd: acc.estimatedCostUsd + usage.estimatedCostUsd,
      // Duration is optional and not aggregatable in a meaningful way;
      // omit it from the merged result — the parent execution has its own duration.
      durationMs: undefined,
    };
  }, initial);
}

/**
 * Calculates the estimated USD cost for a given ModelUsage record using
 * the provided TokenPricingConfig.
 *
 * Formula: `(promptTokens / 1000 * promptPer1kUsd) + (completionTokens / 1000 * completionPer1kUsd)`
 *
 * @param usage - The token usage record to price
 * @param pricing - The pricing rates to apply
 * @returns Estimated cost in USD (may be 0.0 for local/free models)
 *
 * @example
 * const pricing = resolvePricing(ModelProvider.OPENAI, "gpt-4o-mini");
 * const cost = estimateCost({ promptTokens: 500, completionTokens: 200, ... }, pricing);
 */
export function estimateCost(
  usage: Pick<ModelUsage, "promptTokens" | "completionTokens">,
  pricing: TokenPricingConfig,
): number {
  const promptCost = (usage.promptTokens / 1000) * pricing.promptPer1kUsd;
  const completionCost = (usage.completionTokens / 1000) * pricing.completionPer1kUsd;
  // Round to 8 decimal places to avoid floating-point noise in cost calculations
  return Math.round((promptCost + completionCost) * 1e8) / 1e8;
}

/**
 * Convenience function: enriches a ModelUsage record with an estimated cost
 * looked up automatically from the pricing constants by provider and model name.
 *
 * This is the function adapters call after an invocation to populate
 * `estimatedCostUsd` before returning LlmResponse.
 *
 * @param usage - Raw usage (estimatedCostUsd is overwritten)
 * @param provider - ModelProvider for pricing lookup
 * @param modelName - Model identifier string for pricing lookup
 * @returns New ModelUsage record with `estimatedCostUsd` populated
 *
 * @example
 * const enriched = enrichUsageWithCost(rawUsage, ModelProvider.OPENAI, "gpt-4o");
 */
export function enrichUsageWithCost(
  usage: ModelUsage,
  provider: ModelProvider,
  modelName: string,
): ModelUsage {
  const pricing = resolvePricing(provider, modelName);
  return {
    ...usage,
    estimatedCostUsd: estimateCost(usage, pricing),
  };
}
