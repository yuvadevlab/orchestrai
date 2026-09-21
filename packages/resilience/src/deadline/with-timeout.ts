/**
 * High-performance bounded timeout execution wrapper with guaranteed timer cleanup.
 *
 * @module @orchestrai/resilience/deadline
 */

import { TimeoutError } from "./timeout-error";
import type { TimeoutOptions } from "./deadline.types";

/**
 * Wraps an asynchronous task with a strict timeout boundary.
 * If the task does not complete within the allotted milliseconds, the abort signal
 * fires and a TimeoutError (or custom error) is rejected immediately.
 *
 * @template T - Return type of the underlying asynchronous operation
 * @param fn - Asynchronous function receiving an AbortSignal
 * @param timeoutMs - Duration in milliseconds before timeout triggers
 * @param options - Additional timeout configuration options
 * @returns Resolved value of the underlying asynchronous function
 * @throws {TimeoutError} When execution duration exceeds timeoutMs
 */
export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  options: TimeoutOptions = {},
): Promise<T> {
  const operationName = options.operationName ?? "anonymous_operation";

  // Guard against non-positive timeout thresholds
  if (timeoutMs <= 0) {
    throw options.customErrorFactory
      ? options.customErrorFactory(operationName, timeoutMs)
      : new TimeoutError(operationName, timeoutMs, 0);
  }

  // Check if upstream signal is already aborted before initiating work
  if (options.signal?.aborted) {
    throw options.signal.reason instanceof Error
      ? options.signal.reason
      : new Error(String(options.signal.reason ?? "Operation aborted"));
  }

  const controller = new AbortController();
  const startTime = Date.now();
  let timerId: ReturnType<typeof setTimeout> | undefined;

  // Propagate upstream abort signal to local controller
  let onUpstreamAbort: (() => void) | undefined;
  if (options.signal) {
    onUpstreamAbort = (): void => {
      // Forward upstream cancellation to downstream consumer
      controller.abort(options.signal?.reason);
    };
    options.signal.addEventListener("abort", onUpstreamAbort, { once: true });
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      controller.abort();

      const error = options.customErrorFactory
        ? options.customErrorFactory(operationName, timeoutMs)
        : new TimeoutError(operationName, timeoutMs, elapsed);

      reject(error);
    }, timeoutMs);
  });

  try {
    // Race task execution against timeout trigger
    return await Promise.race([fn(controller.signal), timeoutPromise]);
  } finally {
    // Guaranteed cleanup prevents timer leaks on Node.js event loop
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    if (options.signal && onUpstreamAbort) {
      options.signal.removeEventListener("abort", onUpstreamAbort);
    }
  }
}
