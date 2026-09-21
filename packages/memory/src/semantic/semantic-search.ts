/**
 * @file packages/memory/src/semantic/semantic-search.ts
 * @description Advanced semantic retrieval combining vector similarity with recency decay and importance.
 */

import type { IMemoryStorage, MemorySearchQuery, ScoredMemoryItem } from "@/contracts";

/**
 * Weighting parameters for hybrid composite relevance ranking.
 */
export interface RankingWeights {
  /** Weight assigned to raw cosine similarity (default: 0.6) */
  readonly vectorWeight?: number;
  /** Weight assigned to the item's inherent importanceScore (default: 0.25) */
  readonly importanceWeight?: number;
  /** Weight assigned to recency decay score (default: 0.15) */
  readonly recencyWeight?: number;
  /** Half-life decay in days for recency scoring (default: 30) */
  readonly halfLifeDays?: number;
}

/**
 * Enhanced semantic search engine with composite relevance re-ranking.
 */
export class SemanticSearchEngine {
  private readonly storage: IMemoryStorage;
  private readonly vectorWeight: number;
  private readonly importanceWeight: number;
  private readonly recencyWeight: number;
  private readonly halfLifeDays: number;

  constructor(storage: IMemoryStorage, weights?: RankingWeights) {
    this.storage = storage;
    this.vectorWeight = weights?.vectorWeight ?? 0.6;
    this.importanceWeight = weights?.importanceWeight ?? 0.25;
    this.recencyWeight = weights?.recencyWeight ?? 0.15;
    this.halfLifeDays = weights?.halfLifeDays ?? 30;
  }

  /**
   * Searches memory storage and re-ranks results using a multi-factor scoring function.
   *
   * @param query - Input query and optional vector embedding.
   * @returns Re-ranked items ordered by composite score.
   */
  public async searchWithReranking(query: MemorySearchQuery): Promise<ScoredMemoryItem[]> {
    // 1. Fetch vector/text candidates from storage
    const candidates = await this.storage.search(query);
    const now = Date.now();

    // 2. Compute composite score for each candidate
    const scored = candidates.map(({ item, score: rawVectorScore }) => {
      const importance = item.importanceScore ?? 0.5;

      // Recency decay: e^(-lambda * days)
      const ageMs = Math.max(0, now - new Date(item.createdAt).getTime());
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const recency = Math.exp(-Math.LN2 * (ageDays / this.halfLifeDays));

      const compositeScore =
        this.vectorWeight * rawVectorScore +
        this.importanceWeight * importance +
        this.recencyWeight * recency;

      return {
        item,
        score: Math.min(1.0, Math.max(0.0, compositeScore)),
      };
    });

    // 3. Sort descending by composite score
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }
}
