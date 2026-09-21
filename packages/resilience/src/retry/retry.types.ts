/**
 * Type definitions and configuration options for retries, backoff, and jitter.
 *
 * @module @orchestrai/resilience/retry
 */

/**
 * Strategy determining backoff progression across subsequent retry attempts.
 */
export type BackoffStrategy = "exponential" | "linear" | "fixed";

/**
 * Strategy introducing random variance to avoid synchronized thundering herd retry storms.
 */
export type JitterStrategy = "full" | "equal" | "none" | "decorrelated";

/**
 * Options configuring resilient retry execution loops.
 */
export interface RetryOptions {
  /** Maximum number of total attempts including the initial invocation (default: 3) */
  readonly maxAttempts?: number;
  /** Base delay before the first retry in milliseconds (default: 200) */
  readonly initialDelayMs?: number;
  /** Maximum allowable delay cap between retries in milliseconds (default: 10000) */
  readonly maxDelayMs?: number;
  /** Multiplier applied across backoff iterations (default: 2) */
  readonly backoffFactor?: number;
  /** Backoff progression mode (default: 'exponential') */
  readonly backoffStrategy?: BackoffStrategy;
  /** Jitter algorithm applied to calculated delay (default: 'full') */
  readonly jitterStrategy?: JitterStrategy;
  /** Custom predicate deciding if an encountered error qualifies for retry */
  readonly isRetryable?: (error: unknown, attempt: number) => boolean;
  /** Callback fired immediately prior to sleeping for a retry */
  readonly onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  /** Optional cancellation signal to abort pending retry waits */
  readonly signal?: AbortSignal;
}
