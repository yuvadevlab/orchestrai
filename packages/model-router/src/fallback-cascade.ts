/**
 * @file packages/model-router/src/fallback-cascade.ts
 * @description Fault-tolerant fallback executor cascading through ranked deployment candidates.
 * @module @orchestrai/model-router
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { RouterFallbackReason } from "@orchestrai/shared-types";
import type { ModelDeploymentCandidate, FallbackAttempt } from "./types";

const logger = loggerWithConfig(new Logger("FallbackCascade"));

/**
 * Executes an asynchronous invocation with ordered fallback deployments on failure.
 */
export class FallbackCascade {
  /**
   * Executes runner across ordered candidates, advancing to next candidate upon error.
   *
   * @param candidates - Ranked candidate deployments
   * @param executeFn - Execution callback invoked with active candidate
   * @returns Object containing successful candidate, result, and fallback audit attempts
   */
  public async executeWithFallback<T>(
    candidates: readonly ModelDeploymentCandidate[],
    executeFn: (candidate: ModelDeploymentCandidate) => Promise<T>,
  ): Promise<{
    selectedCandidate: ModelDeploymentCandidate;
    result: T;
    attempts: FallbackAttempt[];
  }> {
    if (candidates.length === 0) {
      throw new Error("Cannot execute fallback cascade: No candidate deployments provided");
    }

    const attempts: FallbackAttempt[] = [];

    for (const candidate of candidates) {
      if (!candidate.isHealthy) {
        logger.warn("Skipping unhealthy deployment candidate", {
          candidateId: candidate.candidateId,
          model: candidate.modelIdentifier,
        });
        continue;
      }

      try {
        logger.debug("Attempting inference against deployment candidate", {
          candidateId: candidate.candidateId,
          model: candidate.modelIdentifier,
          providerId: candidate.providerId,
        });

        const result = await executeFn(candidate);
        return { selectedCandidate: candidate, result, attempts };
      } catch (err) {
        const errorMsg = String(err);
        const reason = this.classifyError(errorMsg);

        logger.warn("Deployment candidate invocation failed. Initiating fallback...", {
          candidateId: candidate.candidateId,
          reason,
          error: errorMsg,
        });

        attempts.push({
          candidateId: candidate.candidateId,
          providerId: candidate.providerId,
          reason,
          error: errorMsg,
          timestamp: Date.now(),
        });
      }
    }

    throw new Error(
      `All ${candidates.length} deployment candidates failed in fallback cascade. Last error: ${attempts[attempts.length - 1]?.error || "Unknown"}`,
    );
  }

  /**
   * Classifies thrown error messages into canonical fallback reasons.
   */
  private classifyError(message: string): RouterFallbackReason {
    const lower = message.toLowerCase();
    if (lower.includes("rate limit") || lower.includes("429")) {
      return RouterFallbackReason.RATE_LIMITED;
    }
    if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("deadline")) {
      return RouterFallbackReason.TIMEOUT;
    }
    if (lower.includes("context") || lower.includes("tokens exceeded")) {
      return RouterFallbackReason.CONTEXT_EXCEEDED;
    }
    if (lower.includes("unavailable") || lower.includes("503") || lower.includes("econnrefused")) {
      return RouterFallbackReason.PROVIDER_UNAVAILABLE;
    }
    return RouterFallbackReason.HTTP_ERROR;
  }
}
