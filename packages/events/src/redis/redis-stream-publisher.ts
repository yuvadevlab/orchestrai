/**
 * @file packages/events/src/redis/redis-stream-publisher.ts
 * @description Redis Streams implementation of IEventPublisher using XADD with approximate trimming.
 */

import type { Redis } from "ioredis";
import type { DomainEventEnvelope } from "@orchestrai/core";
import type { IEventPublisher } from "@/contracts/event-bus.interface";
import {
  type RedisStreamPublisherConfig,
  RedisStreamPublisherConfigSchema,
} from "./redis-stream-config";
import { serializeStreamEvent } from "./redis-stream-serializer";

/**
 * Publishes domain events to a durable Redis Stream.
 */
export class RedisStreamPublisher implements IEventPublisher {
  private readonly config: RedisStreamPublisherConfig;
  private readonly redis: Redis;

  public constructor(redis: Redis, config: Partial<RedisStreamPublisherConfig> = {}) {
    this.redis = redis;
    this.config = RedisStreamPublisherConfigSchema.parse(config);
  }

  /**
   * Appends an event to the configured stream using `XADD`.
   *
   * @param event - The validated DomainEventEnvelope to publish.
   */
  public async publish(event: DomainEventEnvelope): Promise<void> {
    const fields = serializeStreamEvent(event);
    const args: (string | number)[] = [this.config.streamKey];

    // Apply MAXLEN trimming if configured
    if (this.config.maxLen > 0) {
      args.push("MAXLEN");
      if (this.config.approximateTrimming) {
        args.push("~");
      }
      args.push(this.config.maxLen);
    }

    // Auto-generate timestamp-based entry ID with '*'
    args.push("*", ...fields);

    await this.redis.xadd(...(args as [string, ...string[]]));
  }

  /**
   * Appends a batch of events sequentially to the stream.
   *
   * @param events - Array of validated DomainEventEnvelope instances.
   */
  public async publishBatch(events: DomainEventEnvelope[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Returns the configured Redis stream key name.
   */
  public getStreamKey(): string {
    return this.config.streamKey;
  }
}
