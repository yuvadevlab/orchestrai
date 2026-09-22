/**
 * @file packages/events/src/delivery/deduplicated-handler.ts
 * @description Higher-order event handler wrapper enforcing exactly-once processing on top of at-least-once streams.
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { DomainEventEnvelope } from "@orchestrai/core";
import type { IIdempotencyStore } from "../idempotency";

/**
 * Options configuring deduplicated event processing.
 */
export interface DeduplicatedHandlerOptions {
  /**
   * Time-to-live in milliseconds for idempotency lock (default 60000ms / 1 min).
   */
  ttlMs?: number;

  /**
   * Custom key derivation function (defaults to event.eventId).
   */
  keyExtractor?: (event: DomainEventEnvelope) => string;
}

/**
 * Wraps an event handler function with idempotency checks to prevent duplicate execution.
 *
 * @param store - IIdempotencyStore instance used for tracking processed event keys.
 * @param handler - Core domain event consumer handler.
 * @param options - Configuration options for deduplication key and TTL.
 * @returns Wrapped handler function enforcing exactly-once execution semantics.
 */
export function createDeduplicatedHandler<TEvent extends DomainEventEnvelope>(
  store: IIdempotencyStore,
  handler: (event: TEvent) => Promise<void>,
  options?: DeduplicatedHandlerOptions,
): (event: TEvent) => Promise<void> {
  const logger = loggerWithConfig(new Logger("DeduplicatedHandler"));
  const ttlMs = options?.ttlMs ?? 60000;
  const getKey = options?.keyExtractor ?? ((e: DomainEventEnvelope) => e.eventId);

  return async (event: TEvent): Promise<void> => {
    const key = getKey(event);
    const executionId = event.executionId;

    // Attempt to acquire idempotency lock
    const acquireResult = await store.acquireKey(key, executionId, ttlMs);

    // Guard clause: if key was not acquired, event has already been processed or is currently processing
    if (!acquireResult.acquired) {
      logger.info(
        `Skipping duplicate event execution [${event.eventType}]: key ${key} already handled`,
      );
      return;
    }

    try {
      // Execute the underlying event handler
      await handler(event);

      // Mark event key as successfully completed in store
      await store.markCompleted(key);
      logger.debug(`Successfully processed deduplicated event [${event.eventType}]: ${key}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`Handler error processing deduplicated event [${event.eventType}]: ${errorMsg}`);

      // Mark key as failed to allow potential retries or forensic inspection
      await store.markFailed(key, errorMsg);
      throw err;
    }
  };
}
