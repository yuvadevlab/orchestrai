/**
 * @file packages/rag/src/storage/postgres-row-mappers.ts
 * @description Row mapping functions transforming PostgreSQL records to domain entities.
 * Enforces defensive schema validation at the database boundary using Zod.
 */

import { DocumentSchema, DocumentChunkSchema } from "../contracts";
import type { Document, DocumentChunk } from "../contracts";
import type { PostgresDocumentRow, PostgresChunkRow } from "./postgres-queries";

/**
 * Maps a relational database row from the `documents` table to a validated Document entity.
 *
 * @param r - Raw database record row
 * @returns Validated Document entity
 */
export function mapDocumentRow(r: PostgresDocumentRow | Record<string, unknown>): Document {
  const mapped = {
    documentId: String(r.document_id),
    tenantId: String(r.tenant_id),
    title: String(r.title),
    sourceUri: String(r.source_uri),
    mimeType: String(r.mime_type ?? "text/plain"),
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(String(r.created_at)).toISOString(),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  };

  // Defensive validation: ensures DB column drift throws immediately with field trace
  return DocumentSchema.parse(mapped);
}

/**
 * Maps a relational database row from the `document_chunks` table to a validated DocumentChunk entity.
 *
 * @param r - Raw database record row
 * @returns Validated DocumentChunk entity
 */
export function mapChunkRow(r: PostgresChunkRow | Record<string, unknown>): DocumentChunk {
  let embedding: number[] | undefined;
  if (typeof r.embedding === "string" && r.embedding) {
    embedding = r.embedding
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map(Number);
  }

  const mapped = {
    chunkId: String(r.chunk_id),
    documentId: String(r.document_id),
    chunkIndex: Number(r.chunk_index),
    content: String(r.content),
    embedding,
    tokenCount: Number(r.token_count ?? 0),
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(String(r.created_at)).toISOString(),
  };

  // Defensive validation: ensures DB column drift throws immediately with field trace
  return DocumentChunkSchema.parse(mapped);
}
