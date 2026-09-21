/**
 * Asynchronous retry execution loop with backoff, jitter, and signal cancellation.
 *
 * @module @orchestrai/resilience/retry
 */

import { calculateRawBackoff, applyJitter } from "./jitter";
import { isTransientError } from "./error-classifier";
import type { RetryOptions } from "./retry.types";

/**
 * Asynchronously pauses execution for a given duration while respecting an AbortSignal.
 *
 * @param ms - Duration to sleep in milliseconds
 * @param signal - Optional AbortSignal
 * @returns Promise that resolves after ms or rejects on abort
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("Retry operation cancelled"));
      return;
    }

    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error("Retry operation cancelled"));
    };

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

/**
 * Executes an asynchronous function with resilient retry logic, backoff, and jitter.
 *
 * @template T - Return type of the asynchronous function
 * @param fn - Asynchronous function receiving attempt count and optional AbortSignal
 * @param options - Configuration options for retry parameters
 * @returns Resolves with the result of fn if successful
 * @throws The last encountered error if all attempts fail or non-retryable error occurs
 */
export async function retryAsync<T>(
  fn: (attempt: number, signal?: AbortSignal) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const initialDelay = Math.max(1, options.initialDelayMs ?? 200);
  const maxDelay = Math.max(initialDelay, options.maxDelayMs ?? 10000);
  const factor = Math.max(1, options.backoffFactor ?? 2);
  const backoffStrategy = options.backoffStrategy ?? "exponential";
  const jitterStrategy = options.jitterStrategy ?? "full";
  const shouldRetry = options.isRetryable ?? isTransientError;

  let lastError: unknown;
  let prevDelay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check if cancellation occurred before invoking attempt
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new Error("Retry operation cancelled");
    }

    try {
      return await fn(attempt, options.signal);
    } catch (err: unknown) {
      lastError = err;

      // Invariant: Do not retry if we have exhausted maximum attempts
      if (attempt >= maxAttempts) {
        break;
      }

      // Invariant: Verify if error is retryable according to classifier or custom predicate
      if (!shouldRetry(err, attempt)) {
        break;
      }

      // Compute raw backoff and apply jitter
      const raw = calculateRawBackoff(attempt, initialDelay, factor, backoffStrategy);
      const delay = applyJitter(raw, initialDelay, maxDelay, jitterStrategy, prevDelay);
      prevDelay = delay;

      // Invoke optional retry listener
      if (options.onRetry) {
        options.onRetry(err, attempt, delay);
      }

      // Await jittered backoff delay before next attempt
      await sleep(delay, options.signal);
    }
  }

  // Re-throw last failure once attempts are exhausted
  throw lastError;
}
