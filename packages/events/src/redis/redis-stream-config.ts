/**
 * @file packages/events/src/redis/redis-stream-config.ts
 * @description Configuration schemas and defaults for Redis Streams event transport.
 */

import { z } from "zod";

/**
 * Configuration options for Redis Stream publisher.
 */
export const RedisStreamPublisherConfigSchema = z.object({
  /** Primary Redis stream key name (defaults to "orchestrai:events:stream") */
  streamKey: z.string().default("orchestrai:events:stream"),
  /** Maximum number of entries retained in the stream (approximate trimming) */
  maxLen: z.number().int().positive().default(100_000),
  /** Whether to use approximate trimming (`~`) for O(1) performance */
  approximateTrimming: z.boolean().default(true),
});

export type RedisStreamPublisherConfig = z.infer<typeof RedisStreamPublisherConfigSchema>;

/**
 * Configuration options for Redis Stream consumer groups.
 */
export const RedisStreamConsumerConfigSchema = z.object({
  /** Redis stream key to consume from */
  streamKey: z.string().default("orchestrai:events:stream"),
  /** Name of the consumer group */
  groupName: z.string().default("orchestrai-consumers"),
  /** Unique name of this specific consumer instance */
  consumerName: z.string().default(() => `consumer-${Math.random().toString(36).slice(2, 10)}`),
  /** Maximum events read per iteration batch */
  batchSize: z.number().int().positive().default(50),
  /** Milliseconds to block waiting for new events in XREADGROUP */
  blockTimeoutMs: z.number().int().nonnegative().default(2_000),
  /** Milliseconds after which an unacknowledged message is considered abandoned and eligible for claiming */
  claimMinIdleTimeMs: z.number().int().positive().default(60_000),
});

export type RedisStreamConsumerConfig = z.infer<typeof RedisStreamConsumerConfigSchema>;
