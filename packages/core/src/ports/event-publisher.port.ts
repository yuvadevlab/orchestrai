/**
 * @file packages/core/src/ports/event-publisher.port.ts
 * @description Abstract messaging port for publishing domain events and streaming token deltas.
 * @module @orchestrai/core/ports
 */

import type { SseEventEnvelope, SseStreamEvent } from "@orchestrai/shared-types";
import type { DomainEventEnvelope } from "../events/event-envelope.schema";

/**
 * Abstract messaging port isolating event emission from Redis, Kafka, or in-memory buses.
 */
export interface IEventPublisher {
  /**
   * Publishes an event to an arbitrary topic or channel.
   */
  publish(channel: string, event: DomainEventEnvelope): Promise<void>;

  /**
   * Publishes a typed SSE stream delta for an active execution run.
   */
  publishStreamEvent<E extends SseStreamEvent>(
    executionId: string,
    envelope: SseEventEnvelope<E>,
  ): Promise<void>;
}
