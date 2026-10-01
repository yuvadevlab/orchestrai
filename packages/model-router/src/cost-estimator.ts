/**
 * @file packages/model-router/src/cost-estimator.ts
 * @description Pre-inference and post-inference cost estimation calculator.
 * @module @orchestrai/model-router
 */

import type { ModelDeploymentCandidate } from "./types";

/**
 * Calculates financial inference expense and token projections.
 */
export class CostEstimator {
  /**
   * Approximates token count from text using character heuristic (~4 chars per token).
   */
  public estimateTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimates monetary cost in USD for an inference call against a candidate deployment.
   *
   * @param candidate - Target model deployment candidate
   * @param promptTokenCount - Number of input prompt tokens
   * @param expectedCompletionTokens - Projected or actual output completion tokens
   * @returns Total projected cost in USD
   */
  public estimateCost(
    candidate: ModelDeploymentCandidate,
    promptTokenCount: number,
    expectedCompletionTokens = 500,
  ): number {
    const promptCost = (promptTokenCount / 1000) * candidate.costPer1kPromptTokensUsd;
    const completionCost =
      (expectedCompletionTokens / 1000) * candidate.costPer1kCompletionTokensUsd;

    return Number((promptCost + completionCost).toFixed(6));
  }
}
