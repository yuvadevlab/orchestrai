/**
 * @file packages/sdk/src/transport/retry-policy.ts
 * @description Exponential backoff with full jitter for resilient network retries.
 */

/**
 * Options configuring exponential retry backoff.
 */
export interface RetryPolicyOptions {
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Base delay in milliseconds */
  baseDelayMs?: number;
  /** Maximum backoff delay cap */
  maxDelayMs?: number;
}

/**
 * Transient error retry evaluator and jittered backoff calculator.
 */
export class RetryPolicy {
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(options: RetryPolicyOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 500;
    this.maxDelayMs = options.maxDelayMs ?? 8000;
  }

  /**
   * Determines if an HTTP response code or error warrants an automated retry.
   */
  public isRetriable(statusCode?: number, error?: unknown): boolean {
    // Retry on rate-limits, gateway timeouts, and transient server outages
    if (statusCode && [429, 502, 503, 504].includes(statusCode)) {
      return true;
    }

    // Retry on standard network drops (FetchError / TypeError on abort or reset)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return true;
    }

    return false;
  }

  /**
   * Calculates backoff delay with full Decorrelated Jitter preventing thundering herds.
   */
  public getDelay(attempt: number, retryAfterSeconds?: number): number {
    // If server sent RFC Retry-After header, prioritize it
    if (retryAfterSeconds && retryAfterSeconds > 0) {
      return retryAfterSeconds * 1000;
    }

    // Exponential backoff: base * 2^attempt
    const exponential = this.baseDelayMs * Math.pow(2, attempt);
    const capped = Math.min(this.maxDelayMs, exponential);

    // Full jitter between 0 and capped delay
    return Math.floor(Math.random() * capped);
  }

  /**
   * Maximum allowed retry attempts.
   */
  public get maximumRetries(): number {
    return this.maxRetries;
  }
}
