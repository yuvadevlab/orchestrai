/**
 * @file packages/rag/src/reranking/relevance-reranker.ts
 * @description Relevance reranker scoring candidates via lexical density and document diversity.
 */

import type { ScoredDocumentChunk } from "../contracts/chunk.schema";
import type { IReranker, RerankOptions } from "./reranker.interface";

/**
 * Heuristic relevance reranker combining semantic score, term density, and document diversity.
 */
export class RelevanceReranker implements IReranker {
  /**
   * Reranks candidate document chunks against the user query.
   */
  async rerank(
    query: string,
    candidates: ScoredDocumentChunk[],
    options: RerankOptions = {},
  ): Promise<ScoredDocumentChunk[]> {
    if (candidates.length === 0) {
      return [];
    }

    const topN = options.topN ?? candidates.length;
    const minScore = options.minScore ?? 0.0;
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Track seen document IDs to penalize duplicate chunks from identical docs (diversity)
    const docOccurrences = new Map<string, number>();

    const rescored = candidates.map((item) => {
      const contentLower = item.chunk.content.toLowerCase();

      // 1. Lexical density score: proportion of query terms present in the text
      let matchedTerms = 0;
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          matchedTerms++;
        }
      }
      const densityScore = queryTerms.length > 0 ? matchedTerms / queryTerms.length : 0.5;

      // 2. Diversity penalty: diminish score for subsequent chunks from same document
      const currentDocCount = docOccurrences.get(item.chunk.documentId) ?? 0;
      docOccurrences.set(item.chunk.documentId, currentDocCount + 1);
      const diversityFactor = 1.0 / (1.0 + currentDocCount * 0.15);

      // 3. Composite score: 60% base similarity + 40% lexical density, scaled by diversity
      const compositeScore = (item.score * 0.6 + densityScore * 0.4) * diversityFactor;

      return {
        ...item,
        score: Math.max(0, Math.min(1, compositeScore)),
      };
    });

    return rescored
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }
}
