/**
 * @file packages/model-router/src/model-router.ts
 * @description Master Model Router engine coordinating ranking, strategy selection, and fallbacks.
 * @module @orchestrai/model-router
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { RoutingStrategy } from "@orchestrai/shared-types";
import type { ModelDeploymentCandidate, RouteRequest, RouteResult } from "./types";
import { LatencyTracker } from "./latency-tracker";
import { CostEstimator } from "./cost-estimator";
import { FallbackCascade } from "./fallback-cascade";

const logger = loggerWithConfig(new Logger("ModelRouter"));

/**
 * Intelligent model router directing prompts across dynamic provider cascades.
 */
export class ModelRouter {
  private readonly candidates = new Map<string, ModelDeploymentCandidate>();
  public readonly latencyTracker: LatencyTracker;
  public readonly costEstimator: CostEstimator;
  public readonly fallbackCascade: FallbackCascade;
  private roundRobinIndex = 0;

  constructor(
    initialCandidates: ModelDeploymentCandidate[] = [],
    latencyTracker = new LatencyTracker(),
    costEstimator = new CostEstimator(),
    fallbackCascade = new FallbackCascade(),
  ) {
    this.latencyTracker = latencyTracker;
    this.costEstimator = costEstimator;
    this.fallbackCascade = fallbackCascade;

    initialCandidates.forEach((c) => this.candidates.set(c.candidateId, c));
  }

  /**
   * Registers or updates a deployment candidate.
   */
  public registerCandidate(candidate: ModelDeploymentCandidate): void {
    logger.info("registerCandidate: registering deployment candidate", {
      candidateId: candidate.candidateId,
      modelIdentifier: candidate.modelIdentifier,
      providerId: candidate.providerId,
    });
    this.candidates.set(candidate.candidateId, candidate);
  }

  /**
   * Removes a candidate deployment.
   */
  public unregisterCandidate(candidateId: string): void {
    logger.info("unregisterCandidate: unregistering deployment candidate", { candidateId });
    this.candidates.delete(candidateId);
  }

  /**
   * Selects and ranks eligible candidates based on specified routing strategy.
   */
  public rankCandidates(request: RouteRequest): ModelDeploymentCandidate[] {
    // Filter healthy candidates with sufficient context window for the requested prompt
    const list = Array.from(this.candidates.values()).filter((c) => {
      if (!c.isHealthy) return false;
      if (request.minContextWindow && c.contextWindow < request.minContextWindow) {
        return false;
      }
      return true;
    });

    if (list.length === 0) {
      logger.warn("rankCandidates: no healthy candidate deployments found matching criteria", {
        strategy: request.strategy,
        minContextWindow: request.minContextWindow,
      });
      return [];
    }

    const promptTokens = this.costEstimator.estimateTokens(request.prompt);

    // Apply the configured routing strategy across available candidates
    switch (request.strategy) {
      case RoutingStrategy.LOWEST_LATENCY:
        return list.sort((a, b) => {
          const aStats = this.latencyTracker.getStats(a.candidateId);
          const bStats = this.latencyTracker.getStats(b.candidateId);
          return aStats.p95Ms - bStats.p95Ms;
        });

      case RoutingStrategy.LEAST_EXPENSIVE:
        return list.sort((a, b) => {
          const aCost = this.costEstimator.estimateCost(a, promptTokens, request.maxTokens);
          const bCost = this.costEstimator.estimateCost(b, promptTokens, request.maxTokens);
          return aCost - bCost;
        });

      case RoutingStrategy.ROUND_ROBIN: {
        const start = this.roundRobinIndex % list.length;
        this.roundRobinIndex = (this.roundRobinIndex + 1) % list.length;
        return [...list.slice(start), ...list.slice(0, start)];
      }

      case RoutingStrategy.PRIORITY_FALLBACK:
      default:
        return list.sort((a, b) => b.priority - a.priority);
    }
  }

  /**
   * Executes inference request with automated fallback cascade and latency observation.
   */
  public async routeAndExecute<T>(
    request: RouteRequest,
    executeFn: (candidate: ModelDeploymentCandidate) => Promise<T>,
  ): Promise<{ result: T; routeResult: RouteResult }> {
    logger.info("routeAndExecute: initiating inference request routing", {
      strategy: request.strategy,
      maxTokens: request.maxTokens,
    });

    const ranked = this.rankCandidates(request);
    // Guard against complete absence of candidates to avoid doomed execution
    if (ranked.length === 0) {
      throw new Error("No eligible and healthy model deployment candidates available");
    }

    const startTime = Date.now();
    const { selectedCandidate, result, attempts } = await this.fallbackCascade.executeWithFallback(
      ranked,
      executeFn,
    );
    const latencyMs = Date.now() - startTime;

    // Record empirical latency for subsequent lowest-latency routing evaluations
    this.latencyTracker.recordLatency(selectedCandidate.candidateId, latencyMs);

    const promptTokens = this.costEstimator.estimateTokens(request.prompt);
    const estimatedCostUsd = this.costEstimator.estimateCost(
      selectedCandidate,
      promptTokens,
      request.maxTokens,
    );

    logger.info("routeAndExecute: inference execution completed successfully", {
      candidateId: selectedCandidate.candidateId,
      modelIdentifier: selectedCandidate.modelIdentifier,
      providerId: selectedCandidate.providerId,
      latencyMs,
      estimatedCostUsd,
    });

    return {
      result,
      routeResult: {
        selectedCandidate,
        fallbackAttempts: attempts,
        estimatedCostUsd,
        latencyMs,
      },
    };
  }
}
