/**
 * @file apps/realtime/src/server/realtime-server.ts
 * @description Coordinates HTTP server, WebSocket gateway, Redis Pub/Sub broker, and SSE fan-out.
 */

import { createServer, type Server } from "node:http";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { ConnectionRegistry } from "@/connection";
import { SubscriptionManager } from "@/subscriptions";
import { RedisPubSubBroker } from "@/broker";
import { WsGateway } from "@/websocket";
import { createHttpRouter } from "./http-router";

import type { RealtimeConfig } from "@/config";

/**
 * Master realtime server coordinating all transports and internal services.
 */
export class RealtimeServer {
  private readonly config: RealtimeConfig;
  private readonly logger: Logger;
  private httpServer?: Server;
  private wssGateway?: WsGateway;
  private redisBroker?: RedisPubSubBroker;

  public readonly registry: ConnectionRegistry;
  public readonly subscriptions: SubscriptionManager;

  public constructor(config: RealtimeConfig) {
    this.config = config;
    this.logger = loggerWithConfig(new Logger("RealtimeServer"));
    this.registry = new ConnectionRegistry(config.maxConnections);
    this.subscriptions = new SubscriptionManager();
  }

  /**
   * Starts all services: Redis Pub/Sub, HTTP server, and WebSocket gateway.
   */
  public async start(): Promise<void> {
    this.logger.info("Starting Realtime Server components...");
    // 1. Connect Redis broker with in-memory fallback if unavailable
    this.redisBroker = new RedisPubSubBroker(this.config.redisUrl);
    await this.redisBroker.start();

    // 2. Subscribe to all OrchestrAI realtime event patterns
    await this.redisBroker.subscribePattern("orchestrai:realtime:*");
    await this.redisBroker.subscribePattern("orchestrai:events:*");

    // 3. Wire incoming Redis messages to SSE/WebSocket fan-out
    this.redisBroker.onMessage((channel, message) => {
      this.fanOutToSubscribers(channel, message);
    });

    // 4. Create HTTP server with the request router
    const router = createHttpRouter({
      registry: this.registry,
      subscriptions: this.subscriptions,
      corsOrigins: this.config.corsOrigins,
      heartbeatIntervalMs: this.config.heartbeatIntervalMs,
    });
    this.httpServer = createServer(router);

    // 5. Attach WebSocket gateway to the same HTTP server
    this.wssGateway = new WsGateway({
      registry: this.registry,
      subscriptions: this.subscriptions,
      jwtSecret: this.config.jwtSecret,
      heartbeatIntervalMs: this.config.heartbeatIntervalMs,
      maxPayloadBytes: this.config.maxPayloadBytes,
    });
    this.wssGateway.attach(this.httpServer);

    // 6. Start HTTP server listener
    await new Promise<void>((resolve) => {
      this.httpServer!.listen(this.config.port, this.config.host, () => {
        this.logger.info("OrchestrAI Realtime Broker started", {
          port: this.config.port,
          host: this.config.host,
        });
        resolve();
      });
    });
  }

  /**
   * Fans out an incoming Redis message to all clients subscribed to the matched topic.
   */
  private fanOutToSubscribers(channel: string, message: string): void {
    // Derive the SSE/WebSocket topic from the Redis channel
    // Convention: 'orchestrai:realtime:execution:<id>' → 'execution:<id>'
    const topic = channel.replace(/^orchestrai:realtime:/, "").replace(/^orchestrai:events:/, "");
    const delivered = this.subscriptions.broadcastToTopic(topic, message, this.registry);

    if (delivered > 0) {
      this.logger.debug("Redis message fanned out", { channel, topic, delivered });
    }
  }

  /**
   * Publishes an event to a topic, both locally and via Redis pub/sub for cross-node delivery.
   */
  public async publish(topic: string, eventType: string, payload: unknown): Promise<void> {
    const ssePayload = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });

    // Deliver locally to connected subscribers
    this.subscriptions.broadcastToTopic(topic, ssePayload, this.registry);

    // Propagate via Redis for cross-instance delivery
    if (this.redisBroker?.isConnected) {
      await this.redisBroker.publish(`orchestrai:realtime:${topic}`, ssePayload);
    }
  }

  /**
   * Returns the HTTP server reference for lifecycle integration.
   */
  public getHttpServer(): Server | undefined {
    return this.httpServer;
  }
}
