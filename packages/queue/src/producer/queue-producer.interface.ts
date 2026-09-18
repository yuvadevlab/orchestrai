/**
 * @file packages/queue/src/producer/queue-producer.interface.ts
 * @description Invariant contract for type-safe job producer abstractions across BullMQ queues.
 */

import type { EnqueueJobOptions, QueueMetrics } from "@/types/queue.types";

/**
 * Common contract implemented by all specialized queue producers.
 * Encapsulates scheduling, batching, and observability inspection.
 *
 * @template TPayload - Strongly-typed job data structure.
 */
export interface IQueueProducer<TPayload> {
  /** Name of the underlying BullMQ queue */
  readonly queueName: string;

  /**
   * Enqueues a single payload into the target queue.
   *
   * @param payload - Validated job data structure.
   * @param options - Scheduling constraints (priority, delay, retry limits).
   * @returns The unique BullMQ job identifier.
   */
  enqueue(payload: TPayload, options?: EnqueueJobOptions): Promise<string>;

  /**
   * Atomically schedules multiple jobs in a single pipeline operation.
   *
   * @param items - Array of payload and option descriptors.
   * @returns Array of assigned job identifiers in matching order.
   */
  enqueueBulk(
    items: ReadonlyArray<{ readonly payload: TPayload; readonly options?: EnqueueJobOptions }>,
  ): Promise<string[]>;

  /**
   * Inspects current backlog counts for backpressure and health reporting.
   *
   * @returns Snapshot of active, waiting, completed, and failed counts.
   */
  getMetrics(): Promise<QueueMetrics>;

  /**
   * Gracefully drains and closes connection handles during shutdown.
   */
  close(): Promise<void>;
}
