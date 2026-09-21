/**
 * @file packages/rag/src/contracts/rag-query.schema.ts
 * @description Zod schemas and types for RAG retrieval filtering, search queries, and hybrid options.
 */

import { z } from "zod";

/**
 * Metadata and tenancy filters applied during document chunk retrieval.
 */
export const RagFilterSchema = z.object({
  /** Optional tenant identifier filter */
  tenantId: z.uuid().optional(),
  /** Restrict retrieval to specific document IDs */
  documentIds: z.array(z.uuid()).optional(),
  /** Filter by document media MIME type */
  mimeType: z.string().optional(),
  /** Exact-match metadata key-value filters */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Filter specification for RAG queries.
 */
export type RagFilter = z.infer<typeof RagFilterSchema>;

/**
 * Common retrieval options across search modalities.
 */
export interface BaseSearchOptions {
  /** Maximum number of chunks to retrieve */
  limit?: number;
  /** Minimum similarity/relevance score threshold (0.0 to 1.0) */
  minScore?: number;
  /** Metadata and tenancy filters */
  filter?: RagFilter;
}

/**
 * Options for dense vector search.
 */
export interface VectorSearchOptions extends BaseSearchOptions {
  /** Dense vector embedding of the query text */
  embedding: number[];
}

/**
 * Options for sparse/lexical keyword search.
 */
export interface KeywordSearchOptions extends BaseSearchOptions {
  /** Raw query text */
  query: string;
}

/**
 * Options for hybrid search combining vector similarity and keyword search.
 */
export interface HybridSearchOptions extends BaseSearchOptions {
  /** Raw query string for keyword retrieval */
  query: string;
  /** Dense vector embedding for vector retrieval */
  embedding: number[];
  /**
   * Weighting factor between keyword (0.0) and vector (1.0) search.
   * Defaults to 0.5 (balanced).
   */
  alpha?: number;
}
