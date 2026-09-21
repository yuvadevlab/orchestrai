/**
 * Fallback execution wrapper providing graceful service degradation under failure.
 *
 * @module @orchestrai/resilience/fallback
 */

import type { FallbackOptions, FallbackHandler } from "./fallback.types";

/**
 * Executes a primary asynchronous task and catches handled failures to seamlessly
 * execute a fallback strategy or return a degraded fallback value.
 *
 * @template T - Return type
 * @param primaryFn - Primary asynchronous operation
 * @param fallback - Fallback value or async handler producing a degraded response
 * @param options - Configuration options
 * @returns Resolved value of primaryFn or the fallback result
 */
export async function withFallback<T>(
  primaryFn: () => Promise<T>,
  fallback: FallbackHandler<T> | T,
  options: FallbackOptions<T> = {},
): Promise<T> {
  const shouldHandle = options.shouldHandle ?? ((): boolean => true);

  try {
    return await primaryFn();
  } catch (err: unknown) {
    // Invariant: Only activate fallback if error matches shouldHandle predicate
    if (!shouldHandle(err)) {
      throw err;
    }

    // Compute fallback value
    const fallbackResult =
      typeof fallback === "function" ? await (fallback as FallbackHandler<T>)(err) : fallback;

    if (options.onFallback) {
      options.onFallback(err, fallbackResult);
    }

    return fallbackResult;
  }
}
