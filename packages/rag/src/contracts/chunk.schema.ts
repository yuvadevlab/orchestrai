/**
 * @file packages/rag/src/contracts/chunk.schema.ts
 * @description Zod validation schemas and types for granular document chunks and search results.
 */

import { z } from "zod";

/**
 * Zod schema validating a document chunk stored with or without embeddings.
 */
export const DocumentChunkSchema = z.object({
  /** Primary identifier for the chunk */
  chunkId: z.uuid(),
  /** Parent document foreign key */
  documentId: z.uuid(),
  /** Zero-based ordinal index of the chunk within the document */
  chunkIndex: z.number().int().nonnegative(),
  /** Raw text content of the chunk */
  content: z.string().min(1),
  /** Dense vector embedding representation */
  embedding: z.array(z.number()).optional(),
  /** Estimated or calculated token count */
  tokenCount: z.number().int().nonnegative().default(0),
  /** Chunk-level metadata tags, headers, and section attributes */
  metadata: z.record(z.string(), z.unknown()).default({}),
  /** Creation timestamp in ISO 8601 format */
  createdAt: z.iso.datetime(),
});

/**
 * Canonical document chunk entity.
 */
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

/**
 * Zod schema for persisting a new chunk.
 */
export const CreateChunkInputSchema = z.object({
  /** Parent document identifier */
  documentId: z.uuid(),
  /** Chunk position index */
  chunkIndex: z.number().int().nonnegative(),
  /** Text content */
  content: z.string().min(1),
  /** Optional pre-computed vector embedding */
  embedding: z.array(z.number()).optional(),
  /** Estimated token count */
  tokenCount: z.number().int().nonnegative().default(0),
  /** Arbitrary metadata */
  metadata: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Payload required to insert a document chunk.
 */
export type CreateChunkInput = z.infer<typeof CreateChunkInputSchema>;

/**
 * Retrieved document chunk augmented with similarity/relevance scoring and source info.
 */
export interface ScoredDocumentChunk {
  /** The matched document chunk entity */
  chunk: DocumentChunk;
  /** Normalized similarity or relevance score (typically 0.0 to 1.0) */
  score: number;
  /** Optional human-readable source title */
  documentTitle?: string;
  /** Optional source URI for citation reference */
  sourceUri?: string;
}
