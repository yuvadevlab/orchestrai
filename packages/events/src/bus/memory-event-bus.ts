/**
 * @file packages/events/src/bus/memory-event-bus.ts
 * @description In-memory, asynchronous, non-blocking event bus implementation for testing and local runtimes.
 */

import type { DomainEventEnvelope } from "@orchestrai/core";
import type { DomainEventType } from "@orchestrai/shared-types";
import type { EventHandler, EventSubscription, IEventBus } from "@/contracts/event-bus.interface";

/**
 * Options for configuring the MemoryEventBus.
 */
export interface MemoryEventBusOptions {
  /** Optional custom error handler when an async listener throws */
  onError?: (error: unknown, event: DomainEventEnvelope) => void;
}

/**
 * In-memory event bus providing fast, decoupled pub/sub semantics without external daemons.
 */
export class MemoryEventBus implements IEventBus {
  /** Registry mapping topic patterns (or "*") to active subscriber handlers */
  private readonly listeners = new Map<string, Set<EventHandler>>();

  /** Handler for errors thrown within subscriber callbacks */
  private readonly onError?: (error: unknown, event: DomainEventEnvelope) => void;

  /** Count of total events published across the lifetime of this bus */
  private publishedCount = 0;

  public constructor(options: MemoryEventBusOptions = {}) {
    this.onError = options.onError;
  }

  /**
   * Dispatches a single domain event to all registered topic listeners and wildcard listeners.
   */
  public async publish(event: DomainEventEnvelope): Promise<void> {
    this.publishedCount += 1;

    // Collect handlers registered for this exact event type and wildcards
    const exactHandlers = this.listeners.get(event.eventType) ?? new Set();
    const wildcardHandlers = this.listeners.get("*") ?? new Set();
    const targetHandlers = [...exactHandlers, ...wildcardHandlers];

    // If no handlers are listening, complete immediately
    if (targetHandlers.length === 0) {
      return;
    }

    // Execute all handlers concurrently with individual error boundaries
    await Promise.all(
      targetHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          // Isolate failures so one bad listener cannot crash the publisher or peer listeners
          if (this.onError) {
            this.onError(err, event);
          }
        }
      }),
    );
  }

  /**
   * Dispatches multiple events in sequential order.
   */
  public async publishBatch(events: DomainEventEnvelope[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Registers a subscriber for an exact event type or wildcard ("*").
   */
  public subscribe(eventType: DomainEventType | "*", handler: EventHandler): EventSubscription {
    const key = eventType;
    let handlers = this.listeners.get(key);

    if (!handlers) {
      handlers = new Set();
      this.listeners.set(key, handlers);
    }

    handlers.add(handler);

    return {
      unsubscribe: () => {
        const currentHandlers = this.listeners.get(key);
        if (currentHandlers) {
          currentHandlers.delete(handler);
          if (currentHandlers.size === 0) {
            this.listeners.delete(key);
          }
        }
      },
    };
  }

  /**
   * Returns the count of registered subscribers for a specific event type or all subscribers.
   */
  public getSubscriberCount(eventType?: DomainEventType | "*"): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size ?? 0;
    }

    let total = 0;
    for (const set of this.listeners.values()) {
      total += set.size;
    }
    return total;
  }

  /**
   * Returns the total number of events published on this bus.
   */
  public getPublishedCount(): number {
    return this.publishedCount;
  }

  /**
   * Clears all registered subscriptions and resets counters.
   */
  public clear(): void {
    this.listeners.clear();
    this.publishedCount = 0;
  }
}
