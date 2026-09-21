/**
 * Type definitions and contracts for Token Bucket rate limiting.
 *
 * @module @orchestrai/resilience/ratelimit
 */

/**
 * Options configuring a Token Bucket rate limiter.
 */
export interface TokenBucketOptions {
  /** Maximum number of tokens the bucket can hold at any instant */
  readonly capacity: number;
  /** Number of tokens replenished per second */
  readonly refillRatePerSecond: number;
  /** Starting token count (defaults to full capacity if omitted) */
  readonly initialTokens?: number;
}

/**
 * Telemetry snapshot of token bucket state.
 */
export interface TokenBucketMetrics {
  /** Configured bucket capacity */
  readonly capacity: number;
  /** Floating-point representation of currently available tokens */
  readonly availableTokens: number;
  /** Configured token replenishment rate per second */
  readonly refillRatePerSecond: number;
}
