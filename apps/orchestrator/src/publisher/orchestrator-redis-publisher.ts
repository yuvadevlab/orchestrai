/**
 * @file apps/orchestrator/src/publisher/orchestrator-redis-publisher.ts
 * @description Redis Pub/Sub publisher distributing orchestrator DAG step events and token deltas.
 * @module apps/orchestrator/publisher
 */

import { Redis } from "ioredis";
import { OrchestratorPubSubEventName } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("OrchestratorRedisPublisher"));

/**
 * Event payload structure published across Redis Pub/Sub channels.
 */
export interface OrchestratorPubSubEvent {
  readonly event: OrchestratorPubSubEventName | string;
  readonly data: unknown;
  readonly executionId: string;
  readonly timestamp: number;
}

/**
 * Publisher transmitting live DAG execution steps and tokens to Redis Pub/Sub channels.
 */
export class OrchestratorRedisPublisher {
  private redisClient: Redis | null = null;
  private isConnected = false;

  constructor(
    private readonly redisUrl: string = process.env.REDIS_URL || "redis://localhost:6379",
  ) {
    this.initClient();
  }

  /**
   * Initializes Redis connection with auto-reconnect strategy.
   */
  private initClient(): void {
    try {
      this.redisClient = new Redis(this.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => Math.min(times * 500, 5000),
      });

      this.redisClient.on("connect", () => {
        this.isConnected = true;
        logger.info("Orchestrator connected to Redis Pub/Sub for real-time fan-out");
      });

      this.redisClient.on("error", (err: Error) => {
        this.isConnected = false;
        logger.debug("Redis Pub/Sub offline (orchestrator continuing in memory mode)", {
          error: err.message,
        });
      });

      void this.redisClient.connect().catch(() => {
        this.isConnected = false;
      });
    } catch (err: unknown) {
      this.isConnected = false;
      logger.debug("Failed to initialize Redis client", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Publishes an event to the execution channel: `orchestrai:realtime:execution:<executionId>`.
   *
   * @param executionId - Execution run identifier
   * @param event - Event name (e.g., 'token', 'step', 'state', 'done')
   * @param data - Arbitrary serialisable event payload
   */
  public publish(executionId: string, event: string, data: unknown): void {
    if (!this.redisClient || !this.isConnected) {
      return;
    }

    const channel = `orchestrai:realtime:execution:${executionId}`;
    const payload: OrchestratorPubSubEvent = {
      event,
      data,
      executionId,
      timestamp: Date.now(),
    };

    this.redisClient.publish(channel, JSON.stringify(payload)).catch(() => {
      // Non-fatal: drop if broker temporarily unavailable
    });
  }

  /**
   * Gracefully closes the Redis connection.
   */
  public async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.isConnected = false;
    }
  }
}

export const orchestratorRedisPublisher = new OrchestratorRedisPublisher();
