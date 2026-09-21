/**
 * @file packages/rag/src/pipeline/rag-pipeline.types.ts
 * @description Configuration contracts, ingestion options, and query results for RagPipeline.
 */

import type { Document } from "../contracts/document.schema";
import type { DocumentChunk, ScoredDocumentChunk } from "../contracts/chunk.schema";
import type { RagFilter } from "../contracts/rag-query.schema";
import type { ChunkOptions } from "../chunking/chunker.interface";
import type { ContextBuildOptions, FormattedContext } from "../context/context-builder.types";

/**
 * Options for ingesting a document into the RAG pipeline.
 */
export interface IngestDocumentOptions {
  /** Document source URI or file path */
  sourceUri: string;
  /** Explicit document title (optional) */
  title?: string;
  /** Media MIME type (defaults to text/plain) */
  mimeType?: string;
  /** Tenancy partition ID */
  tenantId: string;
  /** Custom document and chunk metadata attributes */
  metadata?: Record<string, unknown>;
  /** Optional chunking configuration overrides */
  chunkOptions?: ChunkOptions;
}

/**
 * Outcome of a document ingestion run.
 */
export interface IngestDocumentResult {
  /** Persisted document entity */
  document: Document;
  /** Persisted chunks */
  chunks: DocumentChunk[];
  /** Total tokens across all chunks */
  totalTokens: number;
}

/**
 * Options for querying the RAG pipeline to retrieve relevant context.
 */
export interface QueryRagOptions {
  /** Query text */
  text: string;
  /** Tenancy partition ID */
  tenantId?: string;
  /** Metadata and document filters */
  filter?: RagFilter;
  /** Retrieval candidate limit */
  limit?: number;
  /** Minimum similarity score */
  minScore?: number;
  /** Hybrid search weighting (0.0 = keyword, 1.0 = vector, 0.5 = balanced) */
  alpha?: number;
  /** Number of chunks to retain after reranking */
  topN?: number;
  /** Prompt context assembly configuration */
  contextOptions?: ContextBuildOptions;
}

/**
 * Output of a RAG query including synthesized prompt context and raw chunks.
 */
export interface RagQueryResult {
  /** Assembled prompt context string ready for LLM injection */
  context: FormattedContext;
  /** Ranked and reranked candidate chunks */
  chunks: ScoredDocumentChunk[];
}
