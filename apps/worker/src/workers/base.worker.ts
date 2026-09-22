/**
 * @file apps/worker/src/workers/base.worker.ts
 * @description Abstract base wrapper around BullMQ Worker managing events, lifecycle, and observability.
 */

import { Worker, type Processor, type WorkerOptions } from "bullmq";
import type { Redis } from "ioredis";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

/**
 * Common configuration options for an OrchestrAI background worker.
 */
export interface BaseWorkerConfig<TPayload, TResult> {
  readonly queueName: string;
  readonly connection: Redis;
  readonly processor: Processor<TPayload, TResult, string>;
  readonly concurrency?: number;
  readonly name?: string;
}

/**
 * Abstract base class standardizing BullMQ worker lifecycle and event telemetry.
 */
export abstract class BaseWorker<TPayload = unknown, TResult = unknown> {
  protected readonly worker: Worker<TPayload, TResult, string>;
  protected readonly queueName: string;
  protected readonly workerName: string;
  protected readonly logger: Logger;

  constructor(config: BaseWorkerConfig<TPayload, TResult>) {
    this.queueName = config.queueName;
    this.workerName = config.name ?? `${config.queueName}-worker`;
    this.logger = loggerWithConfig(new Logger(this.workerName));

    const workerOptions: WorkerOptions = {
      connection: config.connection,
      concurrency: config.concurrency ?? 5,
      name: this.workerName,
    };

    // 1. Instantiate the underlying BullMQ worker
    this.worker = new Worker<TPayload, TResult, string>(
      this.queueName,
      config.processor,
      workerOptions,
    );

    // 2. Attach lifecycle diagnostic listeners
    this.attachEventListeners();
  }

  /**
   * Configures event listeners for monitoring, debugging, and reliability tracking.
   */
  private attachEventListeners(): void {
    this.worker.on("completed", (job) => {
      // Inline: Trace job completion without noisy logs for fast tasks
      this.logger.debug(`Job '${job.id}' completed successfully.`);
    });

    this.worker.on("failed", (job, error) => {
      // Always log failed jobs for operational diagnostics
      const jobId = job ? job.id : "unknown";
      const attempts = job ? job.attemptsMade : 0;
      this.logger.error(`Job '${jobId}' failed on attempt ${attempts}: ${error.message}`);
    });

    this.worker.on("error", (error) => {
      // Guard against worker connection failure or unhandled Redis drop
      this.logger.error(`Internal error encountered: ${error.message}`);
    });

    this.worker.on("stalled", (jobId) => {
      // Stalled jobs indicate worker starvation, high memory, or unhandled process crash
      this.logger.warn(`Job '${jobId}' has stalled and will be re-queued.`);
    });
  }

  /**
   * Pauses the worker, preventing it from pulling new jobs from Redis.
   */
  public async pause(): Promise<void> {
    await this.worker.pause();
  }

  /**
   * Resumes pulling jobs from the target queue.
   */
  public resume(): void {
    this.worker.resume();
  }

  /**
   * Closes the worker cleanly, awaiting in-flight executions up to BullMQ default timeout.
   */
  public async close(): Promise<void> {
    await this.worker.close();
  }

  /**
   * Checks whether the worker is currently paused.
   */
  public isPaused(): boolean {
    return this.worker.isPaused();
  }

  /**
   * Returns the queue name assigned to this worker.
   */
  public getQueueName(): string {
    return this.queueName;
  }

  /**
   * Returns the human-readable identifier of this worker.
   */
  public getWorkerName(): string {
    return this.workerName;
  }
}
