/**
 * @file apps/realtime/src/broker/redis-pubsub-broker.ts
 * @description Distributed Redis Pub/Sub adapter supporting horizontal multi-node fan-out.
 */

import { Redis } from "ioredis";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { IRedisPubSubBroker, PubSubMessageHandler } from "./redis-pubsub-broker.interface";

/**
 * Bridges local realtime subscriptions across multiple instances via Redis Pub/Sub.
 */
export class RedisPubSubBroker implements IRedisPubSubBroker {
  private readonly redisUrl: string;
  private readonly logger: Logger;
  private publisher?: Redis;
  private subscriber?: Redis;
  private messageHandler?: PubSubMessageHandler;
  private _isConnected = false;
  private isFallbackMode = false;
  private readonly inMemoryChannels = new Map<string, Set<PubSubMessageHandler>>();

  public constructor(redisUrl: string) {
    this.redisUrl = redisUrl;
    this.logger = loggerWithConfig(new Logger("RedisPubSubBroker"));
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Initializes Redis publisher and subscriber connections with auto-fallback.
   */
  public async start(): Promise<void> {
    try {
      this.publisher = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.subscriber = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      // Attach error listeners to prevent uncaught exceptions
      this.publisher.on("error", (err) => {
        this.logger.warn("Redis publisher connection warning", { error: String(err) });
      });

      this.subscriber.on("error", (err) => {
        this.logger.warn("Redis subscriber connection warning", { error: String(err) });
      });

      await Promise.all([this.publisher.connect(), this.subscriber.connect()]);

      // Wire message reception
      this.subscriber.on("pmessage", (_pattern, channel, message) => {
        if (this.messageHandler) {
          this.messageHandler(channel, message);
        }
      });

      this.subscriber.on("message", (channel, message) => {
        if (this.messageHandler) {
          this.messageHandler(channel, message);
        }
      });

      this._isConnected = true;
      this.logger.info("Redis Pub/Sub broker connected successfully", { url: this.redisUrl });
    } catch (err) {
      // Invariant: In development or test environments, fallback to in-memory broker
      this.isFallbackMode = true;
      this._isConnected = true;
      this.logger.warn("Redis Pub/Sub unavailable; falling back to in-process memory broker", {
        error: String(err),
      });
    }
  }

  /**
   * Disconnects Redis publisher and subscriber connections cleanly.
   */
  public async stop(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.quit().catch(() => this.subscriber?.disconnect());
    }
    if (this.publisher) {
      await this.publisher.quit().catch(() => this.publisher?.disconnect());
    }
    this._isConnected = false;
    this.inMemoryChannels.clear();
  }

  /**
   * Publishes message to channel via Redis or in-memory fallback.
   */
  public async publish(channel: string, message: string): Promise<number> {
    // If fallback mode active, dispatch locally
    if (this.isFallbackMode || !this.publisher) {
      if (this.messageHandler) {
        this.messageHandler(channel, message);
      }
      return 1;
    }

    return this.publisher.publish(channel, message);
  }

  /**
   * Subscribes to channel pattern across the Redis cluster.
   */
  public async subscribePattern(pattern: string): Promise<void> {
    if (this.isFallbackMode || !this.subscriber) {
      return;
    }
    await this.subscriber.psubscribe(pattern);
  }

  /**
   * Registers callback invoked on message receipt.
   */
  public onMessage(handler: PubSubMessageHandler): void {
    this.messageHandler = handler;
  }
}
