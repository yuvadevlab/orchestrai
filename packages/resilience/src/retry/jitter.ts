/**
 * Jitter algorithms for backoff delays to prevent synchronized thundering herd retry storms.
 *
 * @module @orchestrai/resilience/retry
 */

import type { BackoffStrategy, JitterStrategy } from "./retry.types";

/**
 * Calculates raw deterministic backoff delay before jitter is applied.
 *
 * @param attempt - 1-based attempt index
 * @param initialDelay - Base delay in milliseconds
 * @param factor - Backoff multiplication factor
 * @param strategy - Progression strategy
 * @returns Deterministic backoff delay in milliseconds
 */
export function calculateRawBackoff(
  attempt: number,
  initialDelay: number,
  factor: number,
  strategy: BackoffStrategy,
): number {
  const normalizedAttempt = Math.max(1, attempt);

  switch (strategy) {
    case "fixed":
      // Fixed constant interval
      return initialDelay;

    case "linear":
      // Linear increment: initialDelay * attempt
      return initialDelay * normalizedAttempt;

    case "exponential":
    default:
      // Exponential scaling: initialDelay * (factor ^ (attempt - 1))
      return initialDelay * Math.pow(factor, normalizedAttempt - 1);
  }
}

/**
 * Computes actual sleep duration applying the selected jitter distribution.
 *
 * @param rawDelay - Raw calculated backoff delay in milliseconds
 * @param initialDelay - Base delay in milliseconds
 * @param maxDelay - Maximum allowed sleep ceiling
 * @param strategy - Jitter strategy to apply
 * @param prevDelay - Previous sleep delay (required for decorrelated jitter)
 * @returns Jittered sleep duration in milliseconds, bounded by maxDelay
 */
export function applyJitter(
  rawDelay: number,
  initialDelay: number,
  maxDelay: number,
  strategy: JitterStrategy,
  prevDelay = initialDelay,
): number {
  const boundedRaw = Math.min(rawDelay, maxDelay);

  switch (strategy) {
    case "none":
      // No randomization: returns exact bounded backoff
      return boundedRaw;

    case "equal": {
      // Equal jitter: half deterministic, half uniform random variance
      const half = boundedRaw / 2;
      return Math.floor(half + Math.random() * half);
    }

    case "decorrelated": {
      // Decorrelated jitter: sleep = min(maxDelay, rand(initialDelay, prevDelay * 3))
      const ceiling = Math.max(initialDelay, prevDelay * 3);
      const minVal = initialDelay;
      const sample = minVal + Math.random() * (ceiling - minVal);
      return Math.floor(Math.min(maxDelay, sample));
    }

    case "full":
    default:
      // Full jitter: uniform random distribution between 0 and boundedRaw
      return Math.floor(Math.random() * boundedRaw);
  }
}
