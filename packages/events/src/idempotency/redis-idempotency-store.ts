/**
 * @file packages/events/src/idempotency/redis-idempotency-store.ts
 * @description Distributed Redis-backed implementation of IIdempotencyStore using SETNX.
 */

import { createLogger } from "@orchestrai/logger";
import type { Redis } from "ioredis";
import type { IdempotencyRecord } from "./idempotency-record.schema";
import type { AcquireKeyResult, IIdempotencyStore } from "./idempotency-store.interface";

/**
 * Redis-backed idempotency store providing distributed deduplication across nodes.
 */
export class RedisIdempotencyStore implements IIdempotencyStore {
  /**
   * Internal logger instance.
   */
  private readonly logger = createLogger("RedisIdempotencyStore");

  /**
   * Constructs a RedisIdempotencyStore instance.
   *
   * @param redis - Active ioredis client instance.
   * @param keyPrefix - Key prefix namespace for Redis keys (defaults to "orchestrai:idempotency:").
   */
  constructor(
    private readonly redis: Redis,
    private readonly keyPrefix: string = "orchestrai:idempotency:",
  ) {}

  /**
   * Formats a raw key into a fully qualified Redis key with namespace prefix.
   */
  private formatKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Attempts to acquire an idempotency key using Redis atomic SETNX with TTL.
   */
  public async acquireKey(
    key: string,
    executionId: string,
    ttlMs: number,
  ): Promise<AcquireKeyResult> {
    const fullKey = this.formatKey(key);
    const now = Date.now();

    const record: IdempotencyRecord = {
      key,
      executionId,
      status: "PROCESSING",
      expiresAt: now + ttlMs,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    const serialized = JSON.stringify(record);

    // Execute atomic SET key value PX ttl NX command
    const response = await this.redis.set(fullKey, serialized, "PX", ttlMs, "NX");

    // Guard clause: if response is "OK", key was successfully acquired
    if (response === "OK") {
      this.logger.debug(`Acquired distributed idempotency key: ${key}`);
      return {
        acquired: true,
        existingRecord: record,
      };
    }

    // Key already exists — retrieve the existing record from Redis
    const existingRaw = await this.redis.get(fullKey);

    // Guard clause: if existing raw string is missing (e.g. expired right between set & get)
    if (!existingRaw) {
      // Inline comment: Edge case where key expired instantly; attempt re-acquire
      return this.acquireKey(key, executionId, ttlMs);
    }

    const existingRecord = JSON.parse(existingRaw) as IdempotencyRecord;
    this.logger.debug(`Idempotency key collision on Redis: ${key}`);

    return {
      acquired: false,
      existingRecord,
    };
  }

  /**
   * Marks a Redis idempotency record as COMPLETED.
   */
  public async markCompleted(key: string, result?: unknown): Promise<void> {
    const fullKey = this.formatKey(key);
    const existingRaw = await this.redis.get(fullKey);

    // Guard clause: ignore if key is missing or expired in Redis
    if (!existingRaw) {
      // Inline comment: Log warning when updating missing Redis record
      this.logger.warn(`Cannot mark missing Redis key completed: ${key}`);
      return;
    }

    const existing = JSON.parse(existingRaw) as IdempotencyRecord;
    const remainingTtl = Math.max(1, existing.expiresAt - Date.now());

    const updated: IdempotencyRecord = {
      ...existing,
      status: "COMPLETED",
      result,
      updatedAt: new Date().toISOString(),
    };

    // Update record and preserve remaining TTL
    await this.redis.set(fullKey, JSON.stringify(updated), "PX", remainingTtl);
  }

  /**
   * Marks a Redis idempotency record as FAILED.
   */
  public async markFailed(key: string, error: string): Promise<void> {
    const fullKey = this.formatKey(key);
    const existingRaw = await this.redis.get(fullKey);

    // Guard clause: ignore if key is missing or expired
    if (!existingRaw) {
      return;
    }

    const existing = JSON.parse(existingRaw) as IdempotencyRecord;
    const remainingTtl = Math.max(1, existing.expiresAt - Date.now());

    const updated: IdempotencyRecord = {
      ...existing,
      status: "FAILED",
      error,
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(fullKey, JSON.stringify(updated), "PX", remainingTtl);
  }

  /**
   * Retrieves an idempotency record from Redis.
   */
  public async getRecord(key: string): Promise<IdempotencyRecord | null> {
    const fullKey = this.formatKey(key);
    const raw = await this.redis.get(fullKey);

    // Guard clause: return null if key is not present
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as IdempotencyRecord;
  }

  /**
   * Purges expired records (handled automatically by Redis TTL, returns 0).
   */
  public async purgeExpired(): Promise<number> {
    // Inline comment: Redis native key expiration manages TTL eviction automatically
    return 0;
  }
}
