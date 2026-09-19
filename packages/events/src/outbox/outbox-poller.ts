/**
 * @file packages/events/src/outbox/outbox-poller.ts
 * @description Background polling engine that sweeps pending outbox records and publishes them to the event bus.
 */

import { z } from "zod";
import type { IEventPublisher } from "@/contracts/event-bus.interface";
import type { IOutboxStorage } from "./outbox-storage.interface";

/**
 * Configuration schema for the Outbox poller engine.
 */
export const OutboxPollerConfigSchema = z.object({
  /** Interval in milliseconds between polling sweeps */
  intervalMs: z.number().int().positive().default(500),
  /** Maximum number of records claimed per sweep */
  batchSize: z.number().int().positive().default(50),
});

export type OutboxPollerConfig = z.infer<typeof OutboxPollerConfigSchema>;

/**
 * Asynchronous background worker that polls the transactional outbox and forwards events to an IEventPublisher.
 */
export class OutboxPoller {
  private readonly storage: IOutboxStorage;
  private readonly publisher: IEventPublisher;
  private readonly config: OutboxPollerConfig;
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private running = false;

  public constructor(
    storage: IOutboxStorage,
    publisher: IEventPublisher,
    config: Partial<OutboxPollerConfig> = {},
  ) {
    this.storage = storage;
    this.publisher = publisher;
    this.config = OutboxPollerConfigSchema.parse(config);
  }

  /**
   * Executes a single polling sweep: claims pending records, publishes them, and updates their status.
   *
   * @returns Number of events successfully processed and published in this sweep.
   */
  public async pollOnce(): Promise<number> {
    // Guard: Prevent overlapping execution if previous poll is still in flight
    if (this.isProcessing) {
      return 0;
    }

    this.isProcessing = true;
    let publishedCount = 0;

    try {
      const records = await this.storage.claimPendingBatch(this.config.batchSize);

      for (const record of records) {
        try {
          await this.publisher.publish(record.payload);
          await this.storage.markPublished(record.id);
          publishedCount += 1;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          await this.storage.recordFailure(record.id, errorMessage);
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return publishedCount;
  }

  /**
   * Starts the background interval polling loop.
   */
  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.timer = setInterval(() => {
      void this.pollOnce().catch(() => {
        // Suppress unhandled exceptions during background tick
      });
    }, this.config.intervalMs);
  }

  /**
   * Stops the polling loop and cancels any pending interval timer.
   */
  public async stop(): Promise<void> {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Wait for in-flight processing sweep to finish if active
    while (this.isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Returns whether the background poller is active.
   */
  public isRunning(): boolean {
    return this.running;
  }
}
