/**
 * @file apps/gateway/src/validation/rag.schema.ts
 * @description Inbound request validation schemas for RAG ingestion and semantic retrieval.
 */

import { z } from "zod";

/**
 * Validates payload for ingesting a new document into RAG vector storage.
 */
export const IngestDocumentSchema = z.object({
  title: z.string().min(1, "Document title is required").max(255),
  sourceUri: z.string().min(1, "Source URI is required"),
  mimeType: z.string().min(1).default("text/plain"),
  content: z.string().min(1, "Document content is required to chunk and embed"),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type IngestDocumentDto = z.infer<typeof IngestDocumentSchema>;

/**
 * Validates payload for semantic RAG search queries.
 */
export const QueryRagSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
  minScore: z.coerce.number().min(0).max(1).optional().default(0.5),
  alpha: z.coerce.number().min(0).max(1).optional().default(0.5),
  filter: z
    .object({
      documentIds: z.array(z.uuid()).optional(),
      mimeType: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

export type QueryRagDto = z.infer<typeof QueryRagSchema>;
