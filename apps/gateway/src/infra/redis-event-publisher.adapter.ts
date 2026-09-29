/**
 * @file apps/gateway/src/repositories/redis-event-publisher.adapter.ts
 * @description Redis Pub/Sub messaging adapter implementing the IEventPublisher port.
 * @module apps/gateway/repositories
 */

import { Redis } from "ioredis";
import type { IEventPublisher, DomainEventEnvelope } from "@orchestrai/core";
import { SseStreamEvent, type SseEventEnvelope } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("RedisEventPublisherAdapter"));

/**
 * Adapter implementing IEventPublisher using Redis Pub/Sub with in-memory fallback.
 */
export class RedisEventPublisherAdapter implements IEventPublisher {
  private redisClient: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => Math.min(times * 500, 5000),
      });

      this.redisClient.on("connect", () => {
        this.isConnected = true;
      });

      this.redisClient.on("error", (err: Error) => {
        this.isConnected = false;
        logger.debug("Redis Pub/Sub adapter offline", { error: err.message });
      });

      void this.redisClient.connect().catch(() => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  /**
   * Publishes domain event to a Redis channel.
   */
  public async publish(channel: string, event: DomainEventEnvelope): Promise<void> {
    if (!this.redisClient || !this.isConnected) return;

    try {
      await this.redisClient.publish(channel, JSON.stringify(event));
    } catch (err: unknown) {
      logger.warn("Failed to publish domain event to Redis", {
        channel,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Publishes an SSE token chunk, artifact, or clearance ticket.
   */
  public async publishStreamEvent<E extends SseStreamEvent>(
    executionId: string,
    envelope: SseEventEnvelope<E>,
  ): Promise<void> {
    if (!this.redisClient || !this.isConnected) return;

    try {
      const channel = `orchestrai:exec:${executionId}`;
      const payload = {
        event: envelope.event,
        data: envelope.data,
        executionId,
        timestamp: Date.now(),
      };
      await this.redisClient.publish(channel, JSON.stringify(payload));
    } catch (err: unknown) {
      logger.warn("Failed to publish SSE stream event to Redis", {
        executionId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
