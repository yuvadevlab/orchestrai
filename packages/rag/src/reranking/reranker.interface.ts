/**
 * @file packages/rag/src/reranking/reranker.interface.ts
 * @description Contract for candidate reranking in the RAG retrieval pipeline.
 */

import type { ScoredDocumentChunk } from "../contracts/chunk.schema";

/**
 * Options configuring candidate reranking.
 */
export interface RerankOptions {
  /** Maximum top items to retain after reranking */
  topN?: number;
  /** Minimum score threshold post-reranking */
  minScore?: number;
}

/**
 * Contract for post-retrieval reranking algorithms.
 */
export interface IReranker {
  /**
   * Re-evaluates and reorders retrieved candidates according to relevance, diversity, or density.
   *
   * @param query - User query string
   * @param candidates - Initial candidate chunks from vector/hybrid retrieval
   * @param options - Reranking options
   * @returns Re-ordered and scored document chunks
   */
  rerank(
    query: string,
    candidates: ScoredDocumentChunk[],
    options?: RerankOptions,
  ): Promise<ScoredDocumentChunk[]>;
}
