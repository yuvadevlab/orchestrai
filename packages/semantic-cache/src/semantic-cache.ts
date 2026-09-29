/**
 * @file packages/semantic-cache/src/semantic-cache.ts
 * @description In-memory semantic vector cache providing similarity-based query deduplication.
 * @module @orchestrai/semantic-cache
 */

import { randomUUID } from "node:crypto";
import type { IEmbeddingProvider } from "@orchestrai/rag";
import { CacheHitStatus } from "@orchestrai/shared-types";
import type {
  SemanticCacheEntry,
  SemanticCacheOptions,
  CacheLookupResult,
  SemanticCacheStats,
} from "./types";
import { cosineSimilarity } from "./similarity";

/** Default similarity threshold: 0.97 (strictly identical or near-verbatim semantic queries) */
const DEFAULT_SIMILARITY_THRESHOLD = 0.97;
/** Default 1 hour TTL */
const DEFAULT_TTL_MS = 3600000;
/** Default maximum cached entries before LRU eviction */
const DEFAULT_MAX_ENTRIES = 1000;

/**
 * Semantic vector cache matching queries against stored prompt embeddings.
 */
export class SemanticCache<T = unknown> {
  private readonly entries = new Map<string, SemanticCacheEntry<T>>();
  private readonly similarityThreshold: number;
  private readonly defaultTtlMs: number;
  private readonly maxEntries: number;
  private totalHits = 0;
  private totalMisses = 0;

  constructor(
    private readonly embeddingProvider: IEmbeddingProvider,
    options: SemanticCacheOptions = {},
  ) {
    this.similarityThreshold = options.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;
    this.defaultTtlMs = options.defaultTtlMs ?? DEFAULT_TTL_MS;
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  /**
   * Looks up a cached value for a prompt based on cosine vector similarity.
   *
   * @param prompt - Inbound text query prompt
   * @returns CacheLookupResult with match status and value
   */
  public async get(prompt: string): Promise<CacheLookupResult<T>> {
    if (!prompt.trim() || this.entries.size === 0) {
      this.totalMisses += 1;
      return { status: CacheHitStatus.MISS };
    }

    const queryEmbedding = await this.embeddingProvider.embedText(prompt);
    const now = Date.now();

    let bestScore = -1;
    let bestEntry: SemanticCacheEntry<T> | null = null;

    for (const entry of this.entries.values()) {
      // Check expiration
      if (now > entry.expiresAt) {
        this.entries.delete(entry.id);
        continue;
      }

      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    // Evaluate match against strict similarity threshold
    if (bestEntry && bestScore >= this.similarityThreshold) {
      bestEntry.hits += 1;
      this.totalHits += 1;
      return {
        status: CacheHitStatus.HIT,
        value: bestEntry.value,
        similarityScore: bestScore,
        entry: bestEntry,
      };
    }

    this.totalMisses += 1;
    return {
      status: CacheHitStatus.MISS,
      similarityScore: bestScore > 0 ? bestScore : undefined,
    };
  }

  /**
   * Stores a prompt-value pair with calculated vector embeddings.
   *
   * @param prompt - Inbound text query
   * @param value - Output result or completion payload to store
   * @param ttlMs - Optional custom expiration duration in ms
   */
  public async set(
    prompt: string,
    value: T,
    ttlMs = this.defaultTtlMs,
  ): Promise<SemanticCacheEntry<T>> {
    // Evict oldest if reaching capacity
    if (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey) {
        this.entries.delete(oldestKey);
      }
    }

    const embedding = await this.embeddingProvider.embedText(prompt);
    const now = Date.now();
    const entry: SemanticCacheEntry<T> = {
      id: randomUUID(),
      prompt,
      embedding,
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
      hits: 0,
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  /**
   * Clears all cached entries.
   */
  public clear(): void {
    this.entries.clear();
  }

  /**
   * Returns cache operational performance statistics.
   */
  public getStats(): SemanticCacheStats {
    const totalRequests = this.totalHits + this.totalMisses;
    const hitRatio = totalRequests > 0 ? Number((this.totalHits / totalRequests).toFixed(4)) : 0;

    return {
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      totalEntries: this.entries.size,
      hitRatio,
    };
  }
}
