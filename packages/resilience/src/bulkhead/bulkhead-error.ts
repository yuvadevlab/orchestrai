/**
 * Error thrown when a task is rejected due to bulkhead capacity saturation.
 *
 * @module @orchestrai/resilience/bulkhead
 */

/**
 * Standard error raised when a bulkhead has reached its concurrency limit and queue capacity.
 */
export class BulkheadRejectedError extends Error {
  /** Machine-readable error code */
  public readonly code = "BULKHEAD_REJECTED" as const;
  /** Name of the saturated bulkhead */
  public readonly bulkheadName: string;
  /** Maximum concurrent execution capacity */
  public readonly maxConcurrent: number;
  /** Maximum queue capacity */
  public readonly maxQueueSize: number;

  /**
   * Constructs a new BulkheadRejectedError.
   *
   * @param bulkheadName - Name of the bulkhead
   * @param maxConcurrent - Concurrency limit
   * @param maxQueueSize - Queue capacity limit
   */
  public constructor(bulkheadName: string, maxConcurrent: number, maxQueueSize: number) {
    super(
      `Bulkhead '${bulkheadName}' is saturated (active: ${maxConcurrent}, queue: ${maxQueueSize}). Request rejected to prevent capacity starvation.`,
    );
    this.name = "BulkheadRejectedError";
    this.bulkheadName = bulkheadName;
    this.maxConcurrent = maxConcurrent;
    this.maxQueueSize = maxQueueSize;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
