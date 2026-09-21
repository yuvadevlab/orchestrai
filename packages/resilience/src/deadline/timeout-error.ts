/**
 * Structured error thrown when an asynchronous operation exceeds its configured deadline.
 *
 * @module @orchestrai/resilience/deadline
 */

/**
 * Standard error indicating an asynchronous operation timed out.
 */
export class TimeoutError extends Error {
  /** Machine-readable error identifier */
  public readonly code = "TIMEOUT_EXCEEDED" as const;
  /** Descriptive operation name */
  public readonly operationName: string;
  /** Allowed execution time limit in milliseconds */
  public readonly timeoutMs: number;
  /** Approximate elapsed time before interruption in milliseconds */
  public readonly elapsedMs: number;

  /**
   * Constructs a new TimeoutError instance.
   *
   * @param operationName - Name of the operation that timed out
   * @param timeoutMs - Configured timeout duration in milliseconds
   * @param elapsedMs - Actual elapsed time before timeout triggered
   */
  public constructor(operationName: string, timeoutMs: number, elapsedMs = timeoutMs) {
    super(`Operation '${operationName}' timed out after ${timeoutMs}ms (elapsed: ${elapsedMs}ms)`);
    this.name = "TimeoutError";
    this.operationName = operationName;
    this.timeoutMs = timeoutMs;
    this.elapsedMs = elapsedMs;

    // Restore correct prototype chain for custom Error subclasses
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
