/**
 * @file packages/queue/src/connection/redis-connection.ts
 * @description Factory and lifecycle manager for shared Redis connections across BullMQ queues.
 */

import { Redis, type RedisOptions } from "ioredis";
import type { RedisConnectionConfig } from "@/types/queue.types";

/**
 * Creates and configures an `ioredis` client instance tuned specifically for BullMQ.
 *
 * Invariant:
 * BullMQ requires `maxRetriesPerRequest` to be `null` to support blocking commands
 * (e.g. `BRPOPLPUSH`) without throwing unexpected client retry timeout exceptions.
 *
 * @param config - Optional configuration overrides.
 * @returns Connected or connecting Redis client instance.
 */
export function createRedisConnection(config: RedisConnectionConfig = {}): Redis {
  // If a full connection URL is provided, prioritize it
  if (config.url) {
    const client = new Redis(config.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Guard against unhandled error events crashing the Node.js process
    client.on("error", (err) => {
      config.onError?.(err);
    });

    return client;
  }

  const options: RedisOptions = {
    host: config.host ?? process.env.REDIS_HOST ?? "localhost",
    port: config.port ?? Number(process.env.REDIS_PORT ?? 6379),
    password: config.password ?? process.env.REDIS_PASSWORD ?? undefined,
    db: config.db ?? Number(process.env.REDIS_DB ?? 0),
    // BullMQ requirement: do not fail requests when reconnecting
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };

  // Add TLS options if cloud-managed Redis requires SSL/TLS
  if (config.tls) {
    options.tls = {};
  }

  const client = new Redis(options);

  // Attach error handler to prevent unhandled EventEmitter exception crashes
  client.on("error", (err) => {
    config.onError?.(err);
  });

  return client;
}

/**
 * Safely disconnects and flushes an open Redis connection.
 *
 * @param connection - The active Redis client to terminate.
 */
export async function closeRedisConnection(connection: Redis): Promise<void> {
  // Only terminate if status indicates an open or connecting socket
  if (connection.status !== "end") {
    try {
      await connection.quit();
    } catch {
      // If quit() fails or times out, aggressively sever the socket
      connection.disconnect();
    }
  }
}
