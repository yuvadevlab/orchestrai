/**
 * Type definitions and metrics contracts for Bulkhead concurrency isolation.
 *
 * @module @orchestrai/resilience/bulkhead
 */

/**
 * Configuration options for Bulkhead concurrency isolation.
 */
export interface BulkheadOptions {
  /** Descriptive identifier for the isolated resource bulkhead */
  readonly name?: string;
  /** Maximum number of concurrent in-flight executions permitted */
  readonly maxConcurrent: number;
  /** Maximum number of callers permitted to queue waiting for a free slot (default: 0 = fail fast) */
  readonly maxQueueSize?: number;
}

/**
 * Operational telemetry metrics exposed by a Bulkhead.
 */
export interface BulkheadMetrics {
  /** Name of the bulkhead instance */
  readonly name: string;
  /** Number of concurrent tasks currently executing */
  readonly activeCount: number;
  /** Number of callers waiting in queue for execution */
  readonly queuedCount: number;
  /** Number of execution slots currently available */
  readonly availableSlots: number;
  /** Lifetime count of successfully acquired executions */
  readonly totalExecuted: number;
  /** Lifetime count of rejected attempts due to saturation */
  readonly totalRejected: number;
}
