/**
 * @file packages/rag/src/retrieval/hybrid-retriever.ts
 * @description Reciprocal Rank Fusion (RRF) and linear hybrid search score combiner.
 */

import type { ScoredDocumentChunk } from "../contracts/chunk.schema";
import type { IHybridRetriever, HybridFusionOptions } from "./hybrid-retriever.types";

const DEFAULT_RRF_K = 60;
const DEFAULT_LIMIT = 10;

/**
 * Hybrid retrieval engine fusing dense vector similarity and sparse lexical keyword search.
 */
export class HybridRetriever implements IHybridRetriever {
  /**
   * Fuses vector and keyword search results into a unified ranked list.
   */
  fuse(
    vectorResults: ScoredDocumentChunk[],
    keywordResults: ScoredDocumentChunk[],
    options: HybridFusionOptions = {},
  ): ScoredDocumentChunk[] {
    const strategy = options.strategy ?? "rrf";
    const limit = options.limit ?? DEFAULT_LIMIT;

    if (strategy === "linear") {
      return this.fuseLinear(vectorResults, keywordResults, options.alpha ?? 0.5, limit);
    }

    return this.fuseRrf(vectorResults, keywordResults, options.rrfK ?? DEFAULT_RRF_K, limit);
  }

  /**
   * Reciprocal Rank Fusion (RRF): Score(d) = SUM( 1 / (k + rank(d)) )
   * Robust against disparate score distributions between cosine and BM25.
   */
  private fuseRrf(
    vectorResults: ScoredDocumentChunk[],
    keywordResults: ScoredDocumentChunk[],
    k: number,
    limit: number,
  ): ScoredDocumentChunk[] {
    const rrfScores = new Map<string, { chunk: ScoredDocumentChunk; score: number }>();

    // Accumulate reciprocal ranks from vector retrieval
    vectorResults.forEach((item, index) => {
      const rank = index + 1;
      const rrf = 1.0 / (k + rank);
      const existing = rrfScores.get(item.chunk.chunkId);
      if (existing) {
        existing.score += rrf;
      } else {
        rrfScores.set(item.chunk.chunkId, { chunk: item, score: rrf });
      }
    });

    // Accumulate reciprocal ranks from keyword retrieval
    keywordResults.forEach((item, index) => {
      const rank = index + 1;
      const rrf = 1.0 / (k + rank);
      const existing = rrfScores.get(item.chunk.chunkId);
      if (existing) {
        existing.score += rrf;
      } else {
        rrfScores.set(item.chunk.chunkId, { chunk: item, score: rrf });
      }
    });

    return Array.from(rrfScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => ({
        ...entry.chunk,
        score: entry.score,
      }));
  }

  /**
   * Linear interpolation: alpha * vectorScore + (1 - alpha) * keywordScore
   */
  private fuseLinear(
    vectorResults: ScoredDocumentChunk[],
    keywordResults: ScoredDocumentChunk[],
    alpha: number,
    limit: number,
  ): ScoredDocumentChunk[] {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    const merged = new Map<string, ScoredDocumentChunk>();

    for (const vr of vectorResults) {
      merged.set(vr.chunk.chunkId, {
        ...vr,
        score: vr.score * clampedAlpha,
      });
    }

    for (const kr of keywordResults) {
      const existing = merged.get(kr.chunk.chunkId);
      if (existing) {
        existing.score += kr.score * (1 - clampedAlpha);
      } else {
        merged.set(kr.chunk.chunkId, {
          ...kr,
          score: kr.score * (1 - clampedAlpha),
        });
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
