/**
 * @file packages/queue/src/resilience/backoff-strategy.ts
 * @description Exponential backoff calculations with full jitter for distributed retry policies.
 */

/**
 * Configuration options for exponential backoff calculations.
 */
export interface BackoffOptions {
  /** Initial base delay in milliseconds for attempt 1 (default: 1,000ms) */
  readonly baseDelayMs?: number;

  /** Maximum cap on delay in milliseconds (default: 60,000ms) */
  readonly maxDelayMs?: number;

  /** Multiplicative scaling factor for each subsequent attempt (default: 2) */
  readonly factor?: number;
}

/**
 * Calculates exponential backoff delay with Full Jitter to prevent thundering herds.
 *
 * Mathematical Formula:
 * - Exponential ceiling: `ceiling = min(maxDelay, baseDelay * (factor ^ attempt))`
 * - Full Jitter: `delay = floor(random() * ceiling)`
 *
 * Why Full Jitter?
 * When a downstream service (like OpenAI or Redis) recovers from a transient failure,
 * all failing workers retrying at identical fixed intervals would hammer the service
 * in synchronous waves. Full jitter distributes retries uniformly across time.
 *
 * @param attempt - Current zero-based or one-based attempt number.
 * @param options - Backoff constraints (base, max, factor).
 * @returns Randomized delay in milliseconds.
 */
export function calculateBackoffWithJitter(attempt: number, options: BackoffOptions = {}): number {
  const baseDelayMs = options.baseDelayMs ?? 1_000;
  const maxDelayMs = options.maxDelayMs ?? 60_000;
  const factor = options.factor ?? 2;

  // Guard against negative attempt numbers
  const normalizedAttempt = Math.max(0, attempt);

  // Compute exponential upper bound: base * factor^attempt
  const exponentialDelay = baseDelayMs * Math.pow(factor, normalizedAttempt);

  // Cap at the configured maximum delay
  const cappedCeiling = Math.min(maxDelayMs, exponentialDelay);

  // Apply Full Jitter: pick uniformly random value between 0 and cappedCeiling
  return Math.floor(Math.random() * (cappedCeiling + 1));
}

/**
 * Generates BullMQ-compatible backoff strategy definition.
 *
 * @param options - Configuration options for backoff.
 * @returns Object formatted for BullMQ `backoff` property.
 */
export function createBullMQBackoffOptions(options: BackoffOptions = {}): {
  readonly type: string;
  readonly delay: number;
} {
  return {
    type: "exponential",
    delay: options.baseDelayMs ?? 1_000,
  };
}
