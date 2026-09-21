/**
 * Type definitions and contracts for composable resilience pipelines.
 *
 * @module @orchestrai/resilience/pipeline
 */

import type { TimeoutOptions } from "@/deadline";
import type { RetryOptions } from "@/retry";
import type { CircuitBreakerOptions, CircuitBreaker } from "@/circuit-breaker";
import type { BulkheadOptions, Bulkhead } from "@/bulkhead";
import type { FallbackOptions, FallbackHandler } from "@/fallback";
import type { TokenBucketOptions, TokenBucket } from "@/ratelimit";

/**
 * Common contract for executing tasks across resilience boundaries.
 */
export interface IResiliencePolicy<T = unknown> {
  /**
   * Executes an asynchronous operation through the policy boundary.
   *
   * @param fn - Asynchronous function to invoke
   * @returns Resolved result of fn or policy fallback
   */
  execute(fn: (signal?: AbortSignal) => Promise<T>): Promise<T>;
}

/**
 * Configuration options specifying policies applied within a pipeline.
 */
export interface PipelinePolicyOptions<T> {
  /** Bounded timeout in milliseconds */
  timeoutMs?: number;
  /** Timeout configuration options */
  timeoutOptions?: TimeoutOptions;
  /** Retry policy configuration */
  retryOptions?: RetryOptions;
  /** Circuit breaker instance or options */
  circuitBreaker?: CircuitBreaker | CircuitBreakerOptions;
  /** Bulkhead instance or options */
  bulkhead?: Bulkhead | BulkheadOptions;
  /** Rate limiter instance or options */
  rateLimiter?: TokenBucket | TokenBucketOptions;
  /** Fallback result or handler */
  fallback?: FallbackHandler<T> | T;
  /** Fallback options */
  fallbackOptions?: FallbackOptions<T>;
}
