/**
 * @file apps/gateway/src/services/live-execution-redis-publisher.ts
 * @description Bridges gateway execution events to Redis Pub/Sub for high-throughput streaming fan-out.
 * @module apps/gateway/services
 */

import { Redis } from "ioredis";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("GatewayRedisPublisher"));

/**
 * Event payload structure published across Redis Pub/Sub channels.
 */
export interface RedisExecutionEvent {
  readonly event: string;
  readonly data: unknown;
  readonly executionId: string;
  readonly timestamp: number;
}

/**
 * Publisher service transmitting live execution tokens and artifacts over Redis Pub/Sub.
 */
class LiveExecutionRedisPublisher {
  private redisClient: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initClient();
  }

  /**
   * Initializes Redis connection with fault tolerance and silent offline fallback.
   */
  private initClient(): void {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          // Reconnect with exponential backoff capped at 5 seconds
          return Math.min(times * 500, 5000);
        },
      });

      this.redisClient.on("connect", () => {
        this.isConnected = true;
        logger.info("Gateway connected to Redis Pub/Sub for realtime streaming");
      });

      this.redisClient.on("error", (err: Error) => {
        this.isConnected = false;
        logger.debug("Redis Pub/Sub connection offline (falling back to in-process)", {
          error: err.message,
        });
      });

      // Connect asynchronously without blocking gateway boot
      void this.redisClient.connect().catch(() => {
        this.isConnected = false;
      });
    } catch (err: unknown) {
      this.isConnected = false;
      logger.debug("Redis client initialization failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Publishes an event to the execution's dedicated Redis Pub/Sub channel.
   * Channel convention: `orchestrai:realtime:execution:<executionId>`
   *
   * @param executionId - Execution run identifier
   * @param event - Event name (e.g. 'chunk', 'artifact', 'done')
   * @param data - Event payload data
   */
  public publish(executionId: string, event: string, data: unknown): void {
    if (!this.redisClient || !this.isConnected) {
      return;
    }

    const channel = `orchestrai:realtime:execution:${executionId}`;
    const payload: RedisExecutionEvent = {
      event,
      data,
      executionId,
      timestamp: Date.now(),
    };

    this.redisClient.publish(channel, JSON.stringify(payload)).catch(() => {
      // Non-fatal: in-process SSE remains active as fallback
    });
  }
}

export const liveExecutionRedisPublisher = new LiveExecutionRedisPublisher();
