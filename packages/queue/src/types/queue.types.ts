/**
 * @file packages/queue/src/types/queue.types.ts
 * @description Connection, job enqueueing, and observability metric type contracts.
 */

import type { JobPriority } from "./job.types";

/**
 * Configuration options for Redis connection creation.
 */
export interface RedisConnectionConfig {
  /** Redis host address (default: localhost) */
  readonly host?: string;

  /** Redis port number (default: 6379) */
  readonly port?: number;

  /** Optional Redis authentication password */
  readonly password?: string;

  /** Target logical database index (default: 0) */
  readonly db?: number;

  /** Enable TLS connection for cloud/production Redis */
  readonly tls?: boolean;

  /** Maximum reconnection attempts before failing */
  readonly maxRetriesPerRequest?: number | null;

  /** Optional full connection URL string */
  readonly url?: string;

  /** Optional error callback handler for logging or metrics */
  readonly onError?: (err: Error) => void;
}

/**
 * Scheduling and lifecycle options for enqueued BullMQ jobs.
 */
export interface EnqueueJobOptions {
  /**
   * Deterministic identifier for deduplication.
   * If a job with this ID already exists in the queue, BullMQ rejects duplicate creation.
   */
  readonly jobId?: string;

  /** Priority level governing worker pick order */
  readonly priority?: JobPriority;

  /** Delay in milliseconds before the job becomes eligible for worker pickup */
  readonly delayMs?: number;

  /** Total retry attempts permitted before forwarding to dead-letter queue */
  readonly maxAttempts?: number;

  /** Base backoff delay in milliseconds between retry attempts */
  readonly backoffBaseMs?: number;

  /** Whether to automatically purge completed job entries to avoid Redis memory bloat */
  readonly removeOnComplete?: boolean | number;

  /** Retain failed job metadata for inspection or limit to N latest */
  readonly removeOnFail?: boolean | number;
}

/**
 * Snapshot of queue depths and state counts for backpressure monitoring.
 */
export interface QueueMetrics {
  /** Jobs waiting in queue to be picked up by an available worker */
  readonly waiting: number;

  /** Jobs currently in-flight and being processed by workers */
  readonly active: number;

  /** Total jobs completed successfully in retention window */
  readonly completed: number;

  /** Total jobs failed in retention window */
  readonly failed: number;

  /** Jobs scheduled for future execution */
  readonly delayed: number;

  /** Whether the queue is administratively paused */
  readonly isPaused: boolean;
}
