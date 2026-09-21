/**
 * @file packages/rag/src/retrieval/hybrid-retriever.types.ts
 * @description Types and options for hybrid vector and lexical retrieval.
 */

import type { ScoredDocumentChunk } from "../contracts/chunk.schema";

/**
 * Strategy used to fuse multiple search result sets.
 */
export type FusionStrategy = "rrf" | "linear";

/**
 * Options configuring the hybrid retrieval fusion engine.
 */
export interface HybridFusionOptions {
  /**
   * Ranking fusion strategy.
   * Defaults to "rrf" (Reciprocal Rank Fusion).
   */
  strategy?: FusionStrategy;

  /**
   * Smoothing constant k for Reciprocal Rank Fusion.
   * Standard default is 60.
   */
  rrfK?: number;

  /**
   * Linear combination balance weight (0.0 = pure keyword, 1.0 = pure vector).
   * Used when strategy is "linear". Defaults to 0.5.
   */
  alpha?: number;

  /**
   * Maximum merged results to return.
   */
  limit?: number;
}

/**
 * Contract for hybrid retrieval score fusers.
 */
export interface IHybridRetriever {
  /**
   * Fuses vector search and keyword search results into an integrated rank list.
   *
   * @param vectorResults - Ranked results from dense vector search
   * @param keywordResults - Ranked results from sparse keyword search
   * @param options - Fusion options
   * @returns Fused and re-scored document chunks
   */
  fuse(
    vectorResults: ScoredDocumentChunk[],
    keywordResults: ScoredDocumentChunk[],
    options?: HybridFusionOptions,
  ): ScoredDocumentChunk[];
}
