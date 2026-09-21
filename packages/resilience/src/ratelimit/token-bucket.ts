/**
 * Thread-safe in-memory Token Bucket rate limiter for API quotas and throughput pacing.
 *
 * @module @orchestrai/resilience/ratelimit
 */

import { RateLimitExceededError } from "./rate-limit-error";
import type { TokenBucketOptions, TokenBucketMetrics } from "./token-bucket.types";

/**
 * Token Bucket implementation enforcing rate limits by accumulating tokens at a steady rate
 * up to a bounded capacity.
 */
export class TokenBucket {
  public readonly capacity: number;
  public readonly refillRatePerSecond: number;

  private availableTokens: number;
  private lastRefillTimestamp: number;

  /**
   * Constructs a new TokenBucket instance.
   *
   * @param options - Configuration options
   */
  public constructor(options: TokenBucketOptions) {
    this.capacity = Math.max(1, options.capacity);
    this.refillRatePerSecond = Math.max(0.001, options.refillRatePerSecond);
    this.availableTokens = Math.min(
      this.capacity,
      Math.max(0, options.initialTokens ?? this.capacity),
    );
    this.lastRefillTimestamp = Date.now();
  }

  /**
   * Replenishes tokens according to elapsed milliseconds since last evaluation.
   */
  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;

    if (elapsedSeconds > 0) {
      const tokensToAdd = elapsedSeconds * this.refillRatePerSecond;
      // Invariant: tokens can never exceed configured bucket capacity
      this.availableTokens = Math.min(this.capacity, this.availableTokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }

  /**
   * Attempts to consume the specified number of tokens without blocking.
   *
   * @param tokens - Number of tokens to consume (default: 1)
   * @returns True if tokens were available and deducted, false otherwise
   */
  public tryConsume(tokens = 1): boolean {
    this.refill();

    if (this.availableTokens >= tokens) {
      this.availableTokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * Consumes tokens immediately or throws RateLimitExceededError with retryAfterMs.
   *
   * @param tokens - Number of tokens to consume
   * @throws {RateLimitExceededError} If insufficient tokens exist
   */
  public consumeOrThrow(tokens = 1): void {
    if (!this.tryConsume(tokens)) {
      const deficit = tokens - this.availableTokens;
      const retryAfterMs = (deficit / this.refillRatePerSecond) * 1000;
      throw new RateLimitExceededError(retryAfterMs);
    }
  }

  /**
   * Blocks asynchronously until the required tokens are available.
   *
   * @param tokens - Number of tokens needed
   * @param signal - Optional AbortSignal
   */
  public async waitForTokens(tokens = 1, signal?: AbortSignal): Promise<void> {
    while (!this.tryConsume(tokens)) {
      if (signal?.aborted) {
        throw signal.reason ?? new Error("Rate limit wait aborted");
      }

      const deficit = tokens - this.availableTokens;
      const waitMs = Math.max(10, Math.ceil((deficit / this.refillRatePerSecond) * 1000));

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, waitMs);
        if (signal) {
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(signal.reason ?? new Error("Rate limit wait aborted"));
            },
            { once: true },
          );
        }
      });
    }
  }

  /**
   * Executes an asynchronous task after acquiring rate limit tokens.
   *
   * @template T - Return type
   * @param fn - Function to execute
   * @param tokens - Token cost
   * @returns Resolved result of fn
   */
  public async execute<T>(fn: () => Promise<T>, tokens = 1): Promise<T> {
    await this.waitForTokens(tokens);
    return await fn();
  }

  /** Retrieves operational metrics */
  public getMetrics(): TokenBucketMetrics {
    this.refill();
    return {
      capacity: this.capacity,
      availableTokens: Math.floor(this.availableTokens * 100) / 100,
      refillRatePerSecond: this.refillRatePerSecond,
    };
  }
}
