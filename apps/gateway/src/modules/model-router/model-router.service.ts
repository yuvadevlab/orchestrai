/**
 * @file apps/gateway/src/modules/model-router/model-router.service.ts
 * @description Master model router service integrating @orchestrai/model-router into the gateway.
 * Tracks empirical per-model latencies, cost estimates, and intelligent routing fallbacks.
 * @module apps/gateway/modules/model-router
 */

import {
  ModelRouter,
  LatencyTracker,
  CostEstimator,
  FallbackCascade,
  type ModelDeploymentCandidate,
  type RouteRequest,
  LatencyStats,
} from "@orchestrai/model-router";
import { RoutingStrategy } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ModelRouterService"));

/**
 * Singleton model router instance coordinating deployment cascades.
 */
class ModelRouterService {
  private readonly router: ModelRouter;
  private readonly latencyTracker: LatencyTracker;
  private readonly costEstimator: CostEstimator;
  private readonly fallbackCascade: FallbackCascade;

  constructor() {
    this.latencyTracker = new LatencyTracker();
    this.costEstimator = new CostEstimator();
    this.fallbackCascade = new FallbackCascade();
    this.router = new ModelRouter(
      [],
      this.latencyTracker,
      this.costEstimator,
      this.fallbackCascade,
    );
  }

  /**
   * Registers a model candidate from the database or runtime configuration.
   */
  public registerCandidate(candidate: ModelDeploymentCandidate): void {
    this.router.registerCandidate(candidate);
    logger.debug("Registered model candidate in router", { candidateId: candidate.candidateId });
  }

  /**
   * Records empirical latency for an LLM generation turn.
   *
   * @param candidateId - Model candidate identifier
   * @param latencyMs - Observed duration of the turn in milliseconds
   */
  public recordTurnLatency(candidateId: string, latencyMs: number): void {
    this.latencyTracker.recordLatency(candidateId, latencyMs);
    logger.debug("Recorded turn latency for model", { candidateId, latencyMs });
  }

  /**
   * Resolves the highest-ranked model identifier for a given prompt and strategy.
   *
   * @param request - Routing request specifying prompt and strategy
   * @returns Best matching model identifier string, or null if no candidate is registered
   */
  public resolveOptimalModel(request: RouteRequest): string | null {
    const ranked = this.router.rankCandidates({
      strategy: request.strategy ?? RoutingStrategy.PRIORITY_FALLBACK,
      prompt: request.prompt,
      minContextWindow: request.minContextWindow,
      maxTokens: request.maxTokens,
    });

    if (ranked.length > 0 && ranked[0]) {
      return ranked[0].modelIdentifier;
    }

    return null;
  }

  /**
   * Returns latency and empirical performance statistics for all tracked models.
   */
  public getModelStats(candidateId: string): LatencyStats {
    return this.latencyTracker.getStats(candidateId);
  }
}

export const modelRouterService = new ModelRouterService();
