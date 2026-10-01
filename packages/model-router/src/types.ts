/**
 * @file packages/model-router/src/types.ts
 * @description Types and contracts governing model deployment routing, candidates, and cascades.
 * @module @orchestrai/model-router
 */

import type { RoutingStrategy, RouterFallbackReason } from "@orchestrai/shared-types";

/**
 * Candidate deployment endpoint capable of executing inference requests.
 */
export interface ModelDeploymentCandidate {
  readonly candidateId: string;
  readonly providerId: string;
  readonly modelIdentifier: string;
  readonly priority: number;
  readonly costPer1kPromptTokensUsd: number;
  readonly costPer1kCompletionTokensUsd: number;
  readonly contextWindow: number;
  isHealthy: boolean;
}

/**
 * Inbound model routing request options.
 */
export interface RouteRequest {
  readonly prompt: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly tenantId?: string;
  readonly strategy: RoutingStrategy;
  readonly minContextWindow?: number;
}

/**
 * Audit log record of a fallback step taken during routing.
 */
export interface FallbackAttempt {
  readonly candidateId: string;
  readonly providerId: string;
  readonly reason: RouterFallbackReason;
  readonly error: string;
  readonly timestamp: number;
}

/**
 * Output resolution of the model routing process.
 */
export interface RouteResult {
  readonly selectedCandidate: ModelDeploymentCandidate;
  readonly fallbackAttempts: readonly FallbackAttempt[];
  readonly estimatedCostUsd: number;
  readonly latencyMs: number;
}
