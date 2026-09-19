/**
 * @file apps/worker/src/workers/worker-manager.ts
 * @description Coordinates lifecycle, concurrency, and graceful drain across all worker instances.
 */

import { BaseWorker } from "./base.worker";

/**
 * Status snapshot for an individual worker.
 */
export interface WorkerStatusInfo {
  readonly name: string;
  readonly queue: string;
  readonly isPaused: boolean;
}

/**
 * High-level coordinator managing multiple BullMQ background workers.
 */
export class WorkerManager {
  private readonly workers: Map<string, BaseWorker<unknown, unknown>> = new Map();

  /**
   * Registers a worker instance under management.
   *
   * @param worker - Worker instance to manage.
   */
  public register(worker: BaseWorker<unknown, unknown>): this {
    this.workers.set(worker.getWorkerName(), worker);
    return this;
  }

  /**
   * Pauses all registered workers to halt pulling of new jobs from Redis.
   */
  public async pauseAll(): Promise<void> {
    const pausePromises = Array.from(this.workers.values()).map(async (worker) => {
      await worker.pause();
    });
    await Promise.all(pausePromises);
  }

  /**
   * Resumes all registered workers to resume pulling jobs.
   */
  public resumeAll(): void {
    for (const worker of this.workers.values()) {
      worker.resume();
    }
  }

  /**
   * Stops all registered workers cleanly, awaiting in-flight tasks.
   */
  public async stopAll(): Promise<void> {
    const closePromises = Array.from(this.workers.values()).map(async (worker) => {
      await worker.close();
    });
    await Promise.all(closePromises);
  }

  /**
   * Returns a diagnostic snapshot of all registered workers.
   */
  public getStatuses(): readonly WorkerStatusInfo[] {
    return Array.from(this.workers.values()).map((worker) => ({
      name: worker.getWorkerName(),
      queue: worker.getQueueName(),
      isPaused: worker.isPaused(),
    }));
  }

  /**
   * Returns the count of managed workers.
   */
  public get count(): number {
    return this.workers.size;
  }
}
