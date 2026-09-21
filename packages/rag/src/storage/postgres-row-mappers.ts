/**
 * @file packages/rag/src/storage/postgres-row-mappers.ts
 * @description Row mapping functions transforming PostgreSQL records to domain entities.
 */

import type { Document, DocumentChunk } from "../contracts";

/**
 * Maps a relational database row from the `documents` table to a Document entity.
 *
 * @param r - Raw database record row
 * @returns Mapped Document entity
 */
export function mapDocumentRow(r: Record<string, unknown>): Document {
  return {
    documentId: String(r.document_id),
    tenantId: String(r.tenant_id),
    title: String(r.title),
    sourceUri: String(r.source_uri),
    mimeType: String(r.mime_type ?? "text/plain"),
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(String(r.created_at)).toISOString(),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  };
}

/**
 * Maps a relational database row from the `document_chunks` table to a DocumentChunk entity.
 *
 * @param r - Raw database record row
 * @returns Mapped DocumentChunk entity
 */
export function mapChunkRow(r: Record<string, unknown>): DocumentChunk {
  let embedding: number[] | undefined;
  if (typeof r.embedding === "string" && r.embedding) {
    embedding = r.embedding
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map(Number);
  }
  return {
    chunkId: String(r.chunk_id),
    documentId: String(r.document_id),
    chunkIndex: Number(r.chunk_index),
    content: String(r.content),
    embedding,
    tokenCount: Number(r.token_count ?? 0),
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(String(r.created_at)).toISOString(),
  };
}
