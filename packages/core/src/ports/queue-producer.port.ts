/**
 * @file packages/core/src/ports/queue-producer.port.ts
 * @description Abstract job queue port for asynchronous execution and background task dispatch.
 * @module @orchestrai/core/ports
 */

import { QueueBackoffType } from "@orchestrai/shared-types";

/**
 * Scheduling and retry options for dispatched queue jobs.
 */
export interface QueueJobOptions {
  /** Execution priority tier (lower number = higher priority) */
  readonly priority?: number;
  /** Delay in milliseconds before job becomes eligible for processing */
  readonly delayMs?: number;
  /** Maximum retry attempts upon failure */
  readonly maxAttempts?: number;
  /** Backoff strategy configuration */
  readonly backoff?: {
    readonly type: QueueBackoffType;
    readonly delayMs: number;
  };
}

/**
 * Abstract queue producer port isolating job dispatch from BullMQ, SQS, or RabbitMQ.
 */
export interface IQueueProducer {
  /**
   * Dispatches a job payload to a named queue.
   *
   * @param queueName - Destination queue identifier
   * @param jobName - Identifier of job handler
   * @param payload - Serializable job arguments
   * @param options - Scheduling and retry options
   * @returns Generated job identifier
   */
  enqueue<T>(
    queueName: string,
    jobName: string,
    payload: T,
    options?: QueueJobOptions,
  ): Promise<string>;
}
