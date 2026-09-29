/**
 * @file packages/semantic-cache/src/types.ts
 * @description Types and contracts for semantic vector caching and similarity search.
 * @module @orchestrai/semantic-cache
 */

import type { CacheHitStatus } from "@orchestrai/shared-types";

/**
 * Cached vector embedding and output payload entry.
 */
export interface SemanticCacheEntry<T = unknown> {
  readonly id: string;
  readonly prompt: string;
  readonly embedding: readonly number[];
  readonly value: T;
  readonly createdAt: number;
  readonly expiresAt: number;
  hits: number;
}

/**
 * Operational options configuring the semantic cache behavior.
 */
export interface SemanticCacheOptions {
  /** Minimum cosine similarity threshold required for a cache hit (default: 0.97) */
  readonly similarityThreshold?: number;
  /** Default duration in milliseconds before entries expire (default: 3,600,000 ms) */
  readonly defaultTtlMs?: number;
  /** Maximum number of entries kept in memory before LRU eviction */
  readonly maxEntries?: number;
}

/**
 * Result resolution returned from an embedding-based cache lookup.
 */
export interface CacheLookupResult<T = unknown> {
  readonly status: CacheHitStatus;
  readonly value?: T;
  readonly similarityScore?: number;
  readonly entry?: SemanticCacheEntry<T>;
}

/**
 * Aggregate operational telemetry metrics for the semantic cache.
 */
export interface SemanticCacheStats {
  readonly totalHits: number;
  readonly totalMisses: number;
  readonly totalEntries: number;
  readonly hitRatio: number;
}
