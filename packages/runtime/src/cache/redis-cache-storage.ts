/**
 * @file redis-cache-storage.ts
 * @description Distributed Redis-backed cache storage implementation.
 * @module @orchestrai/runtime/cache
 */

import type { ICacheStorage, CacheOptions } from "./cache-storage.interface";
import { MemoryCacheStorage } from "./memory-cache-storage";

/** Minimally required Redis client interface methods */
export interface SimpleRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<unknown>;
  del(key: string): Promise<number>;
  flushdb?(): Promise<unknown>;
}

/**
 * Distributed Redis cache storage with fallback to memory.
 */
export class RedisCacheStorage implements ICacheStorage {
  private readonly fallbackMemory = new MemoryCacheStorage();
  private readonly prefix: string;

  /**
   * @param redis - Minimal Redis client instance or null for memory fallback
   * @param defaultTtlMs - Default TTL in milliseconds (default: 5 mins)
   * @param namespace - Optional namespace prefix (default: "orchestrai:cache:")
   */
  constructor(
    private readonly redis: SimpleRedisClient | null,
    private readonly defaultTtlMs: number = 300_000,
    namespace: string = "orchestrai:cache:",
  ) {
    this.prefix = namespace;
  }

  /**
   * Formats a raw key with namespace prefix.
   */
  private formatKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      return this.fallbackMemory.get<T>(key);
    }

    try {
      const raw = await this.redis.get(this.formatKey(key));

      // Guard clause: Return null if key missing in Redis
      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as T;
    } catch {
      // Degradation guard: Fall back to memory on Redis communication failure
      return this.fallbackMemory.get<T>(key);
    }
  }

  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttlMs = options?.ttlMs ?? this.defaultTtlMs;
    const ttlSeconds = Math.ceil(ttlMs / 1000);

    if (!this.redis) {
      await this.fallbackMemory.set(key, value, options);
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(this.formatKey(key), serialized, "EX", ttlSeconds);
    } catch {
      // Degradation guard: Write to fallback memory cache
      await this.fallbackMemory.set(key, value, options);
    }
  }

  public async delete(key: string): Promise<boolean> {
    if (!this.redis) {
      return this.fallbackMemory.delete(key);
    }

    try {
      const count = await this.redis.del(this.formatKey(key));
      return count > 0;
    } catch {
      return this.fallbackMemory.delete(key);
    }
  }

  public async clear(): Promise<void> {
    if (!this.redis) {
      await this.fallbackMemory.clear();
      return;
    }

    try {
      if (this.redis.flushdb) {
        await this.redis.flushdb();
      }
    } catch {
      await this.fallbackMemory.clear();
    }
  }

  public async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const existing = await this.get<T>(key);

    if (existing !== null) {
      return existing;
    }

    const computedValue = await compute();
    await this.set(key, computedValue, options);
    return computedValue;
  }
}
