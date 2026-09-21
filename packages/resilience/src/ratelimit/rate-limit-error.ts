/**
 * Error thrown when a rate limit token cannot be acquired.
 *
 * @module @orchestrai/resilience/ratelimit
 */

/**
 * Standard error raised when rate limits are exceeded and caller cannot be serviced.
 */
export class RateLimitExceededError extends Error {
  /** Machine-readable error identifier */
  public readonly code = "RATE_LIMIT_EXCEEDED" as const;
  /** Estimated milliseconds until sufficient tokens have replenished */
  public readonly retryAfterMs: number;

  /**
   * Constructs a new RateLimitExceededError.
   *
   * @param retryAfterMs - Milliseconds before token becomes available
   */
  public constructor(retryAfterMs: number) {
    super(`Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs)}ms.`);
    this.name = "RateLimitExceededError";
    this.retryAfterMs = Math.max(0, retryAfterMs);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
