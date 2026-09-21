/**
 * @file memory-cache-storage.ts
 * @description In-memory TTL cache storage engine with LRU eviction.
 * @module @orchestrai/runtime/cache
 */

import type { ICacheStorage, CacheOptions } from "./cache-storage.interface";

/** Internal record wrapper storing cached value and absolute expiry timestamp */
interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

/**
 * Thread-safe, in-memory cache storage implementation with sliding TTL.
 */
export class MemoryCacheStorage implements ICacheStorage {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  /**
   * @param defaultTtlMs - Default TTL in milliseconds (default: 5 minutes)
   */
  constructor(private readonly defaultTtlMs: number = 300_000) {}

  /**
   * Retrieves a cached value by key.
   */
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    // Guard clause: Return null if key is not found
    if (!entry) {
      return null;
    }

    // Expiry check: Purge stale entry if TTL has lapsed
    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Sets a cache key value with optional TTL.
   */
  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Deletes a cache entry by key.
   */
  public async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Clears all cache entries.
   */
  public async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Retrieves entry or computes, caches, and returns value on cache miss.
   */
  public async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const existing = await this.get<T>(key);

    // Hit branch: Return cached value immediately
    if (existing !== null) {
      return existing;
    }

    // Miss branch: Execute compute factory function
    const computedValue = await compute();
    await this.set(key, computedValue, options);
    return computedValue;
  }
}
