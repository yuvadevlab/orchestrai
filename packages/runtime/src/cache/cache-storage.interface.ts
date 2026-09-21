/**
 * @file cache-storage.interface.ts
 * @description Contract defining cache storage backends and TTL cache options.
 * @module @orchestrai/runtime/cache
 */

/**
 * Configuration options for set and getOrSet cache operations.
 */
export interface CacheOptions {
  /** Time-to-live in milliseconds */
  readonly ttlMs?: number;
  /** Namespace prefix for key isolation */
  readonly namespace?: string;
}

/**
 * Core interface for pluggable cache storage backends (Memory, Redis).
 */
export interface ICacheStorage {
  /**
   * Retrieves a cached value by key.
   *
   * @param key - Cache key identifier.
   * @returns Value if found and unexpired, null otherwise.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Sets a cache key value with optional TTL.
   *
   * @param key - Cache key identifier.
   * @param value - Value to cache.
   * @param options - Cache options including TTL.
   */
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

  /**
   * Deletes a cache entry by key.
   *
   * @param key - Cache key identifier.
   * @returns True if deleted, false if key was not present.
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clears all cache entries within the active storage or namespace.
   */
  clear(): Promise<void>;

  /**
   * Retrieves an entry if present, or executes compute function and caches result.
   *
   * @param key - Cache key identifier.
   * @param compute - Factory function producing value on cache miss.
   * @param options - Cache options including TTL.
   */
  getOrSet<T>(key: string, compute: () => Promise<T>, options?: CacheOptions): Promise<T>;
}
