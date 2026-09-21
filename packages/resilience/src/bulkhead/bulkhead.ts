/**
 * Bulkhead semaphore implementation isolating concurrency across critical resource boundaries.
 *
 * @module @orchestrai/resilience/bulkhead
 */

import { BulkheadRejectedError } from "./bulkhead-error";
import type { BulkheadOptions, BulkheadMetrics } from "./bulkhead.types";

/** Internal queue node representing a pending execution slot */
interface QueuedItem {
  resolve: () => void;
  reject: (err: Error) => void;
}

/**
 * Bulkhead isolates finite execution resources (e.g. LLMs, web scraping, database queries)
 * to ensure that one noisy or slow dependency cannot exhaust total worker capacity.
 */
export class Bulkhead {
  public readonly name: string;
  private readonly maxConcurrent: number;
  private readonly maxQueueSize: number;

  private activeCount = 0;
  private queue: QueuedItem[] = [];
  private totalExecuted = 0;
  private totalRejected = 0;

  /**
   * Constructs a new Bulkhead instance.
   *
   * @param options - Configuration options
   */
  public constructor(options: BulkheadOptions) {
    this.name = options.name ?? "default_bulkhead";
    this.maxConcurrent = Math.max(1, options.maxConcurrent);
    this.maxQueueSize = Math.max(0, options.maxQueueSize ?? 0);
  }

  /**
   * Executes an asynchronous task inside the bulkhead concurrency boundary.
   *
   * @template T - Result type
   * @param fn - Asynchronous function to execute once a slot is secured
   * @returns Resolved result of fn
   * @throws {BulkheadRejectedError} When active slots and queue are completely saturated
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireSlot();

    try {
      this.totalExecuted++;
      return await fn();
    } finally {
      this.releaseSlot();
    }
  }

  /**
   * Acquires an execution slot, either immediately if available or by queuing.
   */
  private async acquireSlot(): Promise<void> {
    // If capacity is available, acquire immediate execution slot
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      return;
    }

    // If queue is full, reject immediately to prevent unbounded memory growth
    if (this.queue.length >= this.maxQueueSize) {
      this.totalRejected++;
      throw new BulkheadRejectedError(this.name, this.maxConcurrent, this.maxQueueSize);
    }

    // Queue caller until an active slot is released
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  /**
   * Releases an execution slot and drains the next waiting caller in FIFO order.
   */
  private releaseSlot(): void {
    const next = this.queue.shift();

    if (next) {
      // Pass the freed slot directly to the next queued caller
      next.resolve();
    } else {
      // Decrement active count when no queued callers are waiting
      this.activeCount = Math.max(0, this.activeCount - 1);
    }
  }

  /**
   * Retrieves active operational metrics for this bulkhead.
   */
  public getMetrics(): BulkheadMetrics {
    return {
      name: this.name,
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      availableSlots: Math.max(0, this.maxConcurrent - this.activeCount),
      totalExecuted: this.totalExecuted,
      totalRejected: this.totalRejected,
    };
  }
}
