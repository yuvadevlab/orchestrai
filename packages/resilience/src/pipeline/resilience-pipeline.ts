/**
 * Composable resilience pipeline chaining timeouts, retries, circuit breakers,
 * bulkheads, rate limits, and fallbacks.
 *
 * @module @orchestrai/resilience/pipeline
 */

import { withTimeout, type TimeoutOptions } from "@/deadline";
import { retryAsync, type RetryOptions } from "@/retry";
import { CircuitBreaker, type CircuitBreakerOptions } from "@/circuit-breaker";
import { Bulkhead, type BulkheadOptions } from "@/bulkhead";
import { TokenBucket, type TokenBucketOptions } from "@/ratelimit";
import { withFallback, type FallbackOptions, type FallbackHandler } from "@/fallback";
import type { IResiliencePolicy, PipelinePolicyOptions } from "./pipeline.types";

/**
 * Concrete pipeline chaining multi-layered fault-tolerance policies.
 */
export class ResiliencePipeline<T = unknown> implements IResiliencePolicy<T> {
  private readonly timeoutMs?: number;
  private readonly timeoutOptions?: TimeoutOptions;
  private readonly retryOptions?: RetryOptions;
  private readonly circuitBreaker?: CircuitBreaker;
  private readonly bulkhead?: Bulkhead;
  private readonly rateLimiter?: TokenBucket;
  private readonly fallback?: FallbackHandler<T> | T;
  private readonly fallbackOptions?: FallbackOptions<T>;

  /**
   * Internal constructor initialized via Builder.
   */
  public constructor(options: PipelinePolicyOptions<T>) {
    this.timeoutMs = options.timeoutMs;
    this.timeoutOptions = options.timeoutOptions;
    this.retryOptions = options.retryOptions;
    this.circuitBreaker =
      options.circuitBreaker instanceof CircuitBreaker
        ? options.circuitBreaker
        : options.circuitBreaker
          ? new CircuitBreaker(options.circuitBreaker)
          : undefined;
    this.bulkhead =
      options.bulkhead instanceof Bulkhead
        ? options.bulkhead
        : options.bulkhead
          ? new Bulkhead(options.bulkhead)
          : undefined;
    this.rateLimiter =
      options.rateLimiter instanceof TokenBucket
        ? options.rateLimiter
        : options.rateLimiter
          ? new TokenBucket(options.rateLimiter)
          : undefined;
    this.fallback = options.fallback;
    this.fallbackOptions = options.fallbackOptions;
  }

  /**
   * Creates a fluent pipeline builder.
   */
  public static builder<U = unknown>(): ResiliencePipelineBuilder<U> {
    return new ResiliencePipelineBuilder<U>();
  }

  /**
   * Executes an asynchronous task through all configured resilience boundaries in order:
   * Fallback -> RateLimiter -> Retry -> CircuitBreaker -> Bulkhead -> Timeout -> fn
   */
  public async execute(fn: (signal?: AbortSignal) => Promise<T>): Promise<T> {
    // Innermost core execution wrapped with timeout if configured
    const coreExecution = async (signal?: AbortSignal): Promise<T> => {
      if (this.timeoutMs !== undefined && this.timeoutMs > 0) {
        return await withTimeout((timeoutSignal) => fn(timeoutSignal), this.timeoutMs, {
          ...this.timeoutOptions,
          signal,
        });
      }
      return await fn(signal);
    };

    // Bulkhead concurrency isolation wrapper
    const bulkheadExecution = async (signal?: AbortSignal): Promise<T> => {
      if (this.bulkhead) {
        return await this.bulkhead.execute(() => coreExecution(signal));
      }
      return await coreExecution(signal);
    };

    // Circuit breaker state machine wrapper
    const circuitBreakerExecution = async (signal?: AbortSignal): Promise<T> => {
      if (this.circuitBreaker) {
        return await this.circuitBreaker.execute(() => bulkheadExecution(signal));
      }
      return await bulkheadExecution(signal);
    };

    // Retry execution with backoff and jitter wrapper
    const retryExecution = async (signal?: AbortSignal): Promise<T> => {
      if (this.retryOptions) {
        return await retryAsync(
          (_attempt, retrySignal) => circuitBreakerExecution(retrySignal ?? signal),
          { ...this.retryOptions, signal },
        );
      }
      return await circuitBreakerExecution(signal);
    };

    // Rate limiter pacing wrapper
    const rateLimitedExecution = async (signal?: AbortSignal): Promise<T> => {
      if (this.rateLimiter) {
        await this.rateLimiter.waitForTokens(1, signal);
      }
      return await retryExecution(signal);
    };

    // Outermost graceful degradation fallback wrapper
    if (this.fallback !== undefined) {
      return await withFallback(() => rateLimitedExecution(), this.fallback, this.fallbackOptions);
    }

    return await rateLimitedExecution();
  }
}

/**
 * Fluent builder constructing a configured ResiliencePipeline.
 */
export class ResiliencePipelineBuilder<T = unknown> {
  private options: PipelinePolicyOptions<T> = {};

  public withTimeout(ms: number, options?: TimeoutOptions): this {
    this.options.timeoutMs = ms;
    this.options.timeoutOptions = options;
    return this;
  }

  public withRetry(options: RetryOptions): this {
    this.options.retryOptions = options;
    return this;
  }

  public withCircuitBreaker(breakerOrOptions: CircuitBreaker | CircuitBreakerOptions): this {
    this.options.circuitBreaker = breakerOrOptions;
    return this;
  }

  public withBulkhead(bulkheadOrOptions: Bulkhead | BulkheadOptions): this {
    this.options.bulkhead = bulkheadOrOptions;
    return this;
  }

  public withRateLimiter(limiterOrOptions: TokenBucket | TokenBucketOptions): this {
    this.options.rateLimiter = limiterOrOptions;
    return this;
  }

  public withFallback(fallback: FallbackHandler<T> | T, options?: FallbackOptions<T>): this {
    this.options.fallback = fallback;
    this.options.fallbackOptions = options;
    return this;
  }

  public build(): ResiliencePipeline<T> {
    return new ResiliencePipeline<T>(this.options);
  }
}
