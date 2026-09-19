/**
 * @file packages/events/src/contracts/event-bus.interface.ts
 * @description Master publisher, subscriber, and event bus interfaces for OrchestrAI.
 */

import type { DomainEventEnvelope } from "@orchestrai/core";
import type { DomainEventType } from "@orchestrai/shared-types";

/**
 * Callback handler invoked when a matching domain event is received.
 */
export type EventHandler<TEvent extends DomainEventEnvelope = DomainEventEnvelope> = (
  event: TEvent,
) => void | Promise<void>;

/**
 * Handle returned to subscribers allowing idempotent unsubscription.
 */
export interface EventSubscription {
  /** Unregisters the subscriber from receiving further events */
  unsubscribe: () => void;
}

/**
 * Contract for components capable of publishing domain events.
 */
export interface IEventPublisher {
  /**
   * Emits a single domain event envelope.
   *
   * @param event - The validated event envelope to emit.
   */
  publish(event: DomainEventEnvelope): Promise<void>;

  /**
   * Emits an atomic or contiguous sequence of domain events.
   *
   * @param events - Array of validated event envelopes.
   */
  publishBatch(events: DomainEventEnvelope[]): Promise<void>;
}

/**
 * Contract for components that subscribe to domain event topics or wildcards.
 */
export interface IEventSubscriber {
  /**
   * Registers a listener for an exact domain event type or all events ("*").
   *
   * @param eventType - Target DomainEventType or "*" for global tap.
   * @param handler - Callback function executing on event receipt.
   * @returns Subscription handle with an unsubscribe method.
   */
  subscribe(eventType: DomainEventType | "*", handler: EventHandler): EventSubscription;
}

/**
 * Unified bi-directional event bus uniting publisher and subscriber capabilities.
 */
export interface IEventBus extends IEventPublisher, IEventSubscriber {
  /**
   * Removes all registered subscribers and releases memory.
   */
  clear(): void;
}
