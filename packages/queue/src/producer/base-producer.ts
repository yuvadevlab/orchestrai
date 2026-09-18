/**
 * @file packages/queue/src/producer/base-producer.ts
 * @description Abstract base producer managing BullMQ Queue instances, retry policies, and metrics.
 */

import { Queue, type JobsOptions } from "bullmq";
import type { Redis } from "ioredis";
import { QueueError, OrchestrAIError } from "@orchestrai/core";
import type { IQueueProducer } from "./queue-producer.interface";
import type { EnqueueJobOptions, QueueMetrics } from "@/types/queue.types";

/**
 * Base class encapsulating BullMQ queue connectivity and job dispatching mechanics.
 */
export abstract class BaseQueueProducer<TPayload> implements IQueueProducer<TPayload> {
  public readonly queueName: string;
  protected readonly queue: Queue<unknown, unknown, string>;

  /**
   * Initializes the BullMQ Queue instance backed by shared Redis connection.
   *
   * @param queueName - Unique queue identifier string.
   * @param connection - Shared ioredis client instance.
   */
  public constructor(queueName: string, connection: Redis) {
    this.queueName = queueName;

    // Initialize BullMQ Queue with shared Redis connection
    this.queue = new Queue<unknown, unknown, string>(queueName, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1_000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }

  /**
   * Validates and optionally transforms a payload prior to enqueueing.
   * Subclasses override this method to run Zod schema parsing.
   *
   * @param raw - Candidate job payload.
   * @returns Clean, validated payload.
   */
  protected abstract validatePayload(raw: unknown): TPayload;

  /**
   * Enqueues a single job into the BullMQ queue.
   */
  public async enqueue(payload: TPayload, options: EnqueueJobOptions = {}): Promise<string> {
    const validated = this.validatePayload(payload);
    const jobOptions = this.mapOptions(options);

    try {
      // Add job to BullMQ queue; default name is "execute"
      const job = await this.queue.add("execute", validated, jobOptions);

      if (!job.id) {
        throw new QueueError(`Failed to generate jobId for queue: ${this.queueName}`);
      }

      return job.id;
    } catch (error) {
      if (error instanceof OrchestrAIError) {
        throw error;
      }
      throw new QueueError(
        `Failed to enqueue job to '${this.queueName}': ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  /**
   * Bulk enqueues multiple items in a single Redis pipeline call.
   */
  public async enqueueBulk(
    items: ReadonlyArray<{ readonly payload: TPayload; readonly options?: EnqueueJobOptions }>,
  ): Promise<string[]> {
    const bulkJobs = items.map((item) => ({
      name: "execute",
      data: this.validatePayload(item.payload),
      opts: this.mapOptions(item.options ?? {}),
    }));

    try {
      const jobs = await this.queue.addBulk(bulkJobs);
      return jobs.map((job) => job.id ?? "unknown");
    } catch (error) {
      if (error instanceof OrchestrAIError) {
        throw error;
      }
      throw new QueueError(
        `Failed to bulk enqueue ${items.length} jobs to '${this.queueName}': ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  /**
   * Retrieves operational metrics for queue depth inspection.
   */
  public async getMetrics(): Promise<QueueMetrics> {
    const [counts, isPaused] = await Promise.all([
      this.queue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
      this.queue.isPaused(),
    ]);

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
      isPaused,
    };
  }

  /**
   * Gracefully closes the underlying BullMQ queue handle.
   */
  public async close(): Promise<void> {
    await this.queue.close();
  }

  /**
   * Maps high-level EnqueueJobOptions to BullMQ JobsOptions.
   */
  private mapOptions(options: EnqueueJobOptions): JobsOptions {
    const opts: JobsOptions = {};

    if (options.jobId) {
      opts.jobId = options.jobId;
    }
    if (options.priority !== undefined) {
      opts.priority = options.priority;
    }
    if (options.delayMs !== undefined && options.delayMs > 0) {
      opts.delay = options.delayMs;
    }
    if (options.maxAttempts !== undefined && options.maxAttempts > 0) {
      opts.attempts = options.maxAttempts;
    }
    if (options.backoffBaseMs !== undefined) {
      opts.backoff = {
        type: "exponential",
        delay: options.backoffBaseMs,
      };
    }
    if (options.removeOnComplete !== undefined) {
      opts.removeOnComplete = options.removeOnComplete;
    }
    if (options.removeOnFail !== undefined) {
      opts.removeOnFail = options.removeOnFail;
    }

    return opts;
  }
}
