/**
 * @file packages/events/src/redis/redis-stream-consumer.ts
 * @description Redis Streams consumer group worker implementing at-least-once message processing and acknowledgment.
 */

import type { Redis } from "ioredis";
import type { DomainEventEnvelope } from "@orchestrai/core";
import {
  type RedisStreamConsumerConfig,
  RedisStreamConsumerConfigSchema,
} from "./redis-stream-config";
import { deserializeStreamEvent } from "./redis-stream-serializer";

/**
 * Handler callback processing an event read from a Redis Stream.
 */
export type StreamConsumerHandler = (
  event: DomainEventEnvelope,
  streamEntryId: string,
) => Promise<void>;

/**
 * Consumes events from a Redis Stream as part of a distributed consumer group.
 */
export class RedisStreamConsumer {
  private readonly config: RedisStreamConsumerConfig;
  private readonly redis: Redis;
  private running = false;
  private loopPromise: Promise<void> | null = null;

  public constructor(redis: Redis, config: Partial<RedisStreamConsumerConfig> = {}) {
    this.redis = redis;
    this.config = RedisStreamConsumerConfigSchema.parse(config);
  }

  /**
   * Initializes the Redis consumer group on the stream if it does not already exist.
   * Uses `MKSTREAM` to automatically create an empty stream if omitted.
   */
  public async ensureConsumerGroup(): Promise<void> {
    try {
      await this.redis.xgroup(
        "CREATE",
        this.config.streamKey,
        this.config.groupName,
        "$",
        "MKSTREAM",
      );
    } catch (err: unknown) {
      // BUSYGROUP Consumer Group name already exists — safe to ignore
      if (err instanceof Error && err.message.includes("BUSYGROUP")) {
        return;
      }
      throw err;
    }
  }

  /**
   * Acknowledges an entry, removing it from the consumer group's Pending Entries List (PEL).
   */
  public async ack(streamEntryId: string): Promise<number> {
    return this.redis.xack(this.config.streamKey, this.config.groupName, streamEntryId);
  }

  /**
   * Reads a single batch of unread events from the stream using XREADGROUP.
   */
  public async readBatch(): Promise<Array<{ id: string; event: DomainEventEnvelope }>> {
    const raw = (await this.redis.xreadgroup(
      "GROUP",
      this.config.groupName,
      this.config.consumerName,
      "COUNT",
      this.config.batchSize,
      "BLOCK",
      this.config.blockTimeoutMs,
      "STREAMS",
      this.config.streamKey,
      ">",
    )) as [string, [string, string[]][]][] | null;

    if (!raw || raw.length === 0) {
      return [];
    }

    const [, streamEntries] = raw[0] ?? [];
    if (!streamEntries) {
      return [];
    }

    const results: Array<{ id: string; event: DomainEventEnvelope }> = [];
    for (const [id, fields] of streamEntries) {
      try {
        const event = deserializeStreamEvent(fields);
        results.push({ id, event });
      } catch {
        // Skip malformed entries without failing the batch
      }
    }

    return results;
  }

  /**
   * Starts a long-running consumption loop that continuously polls and dispatches events.
   */
  public async start(handler: StreamConsumerHandler): Promise<void> {
    if (this.running) {
      return;
    }

    await this.ensureConsumerGroup();
    this.running = true;

    this.loopPromise = (async () => {
      while (this.running) {
        try {
          const entries = await this.readBatch();
          for (const { id, event } of entries) {
            // If stopped while processing a batch, break early
            if (!this.running) {
              break;
            }

            await handler(event, id);
            await this.ack(id);
          }
        } catch {
          // Pause briefly on connection failure before next poll
          if (this.running) {
            await new Promise((resolve) => setTimeout(resolve, 1_000));
          }
        }
      }
    })();
  }

  /**
   * Signals the consumption loop to halt gracefully and awaits in-flight batch completion.
   */
  public async stop(): Promise<void> {
    this.running = false;
    if (this.loopPromise) {
      await this.loopPromise;
      this.loopPromise = null;
    }
  }

  /**
   * Returns whether the consumer loop is actively running.
   */
  public isRunning(): boolean {
    return this.running;
  }
}
