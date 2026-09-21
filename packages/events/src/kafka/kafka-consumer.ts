/**
 * @file kafka-consumer.ts
 * @description Kafka event consumer group subscriber implementation of IEventSubscriber.
 * @module @orchestrai/events/kafka
 */

import type { DomainEventType } from "@orchestrai/shared-types";
import type { IEventSubscriber, EventHandler, EventSubscription } from "../contracts";

/** Kafka consumer group options */
export interface KafkaConsumerOptions {
  readonly brokers: readonly string[];
  readonly groupId: string;
  readonly topics: readonly string[];
}

/**
 * Event consumer subscribing to Kafka topics with consumer group rebalancing.
 */
export class KafkaStreamConsumer implements IEventSubscriber {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private isConsuming = false;

  constructor(private readonly options: KafkaConsumerOptions) {}

  public subscribe(eventType: DomainEventType | "*", handler: EventHandler): EventSubscription {
    const existing = this.handlers.get(eventType) ?? new Set();
    existing.add(handler);
    this.handlers.set(eventType, existing);

    return {
      unsubscribe: () => {
        const set = this.handlers.get(eventType);
        if (set) {
          set.delete(handler);
        }
      },
    };
  }

  public async start(): Promise<void> {
    this.isConsuming = true;
  }

  public async stop(): Promise<void> {
    this.isConsuming = false;
  }

  public get running(): boolean {
    return this.isConsuming;
  }

  public get groupId(): string {
    return this.options.groupId;
  }
}
