/**
 * @file packages/rag/src/storage/postgres-queries.ts
 * @description Centralized SQL query catalog and typed row interfaces for RAG storage.
 *
 * Invariant:
 * Pure SQL files are co-located in `packages/rag/src/storage/sql/` for rapid inspection,
 * database benchmarking, and direct psql debugging.
 */

import type { RagFilter } from "../contracts";

/**
 * Raw database row structure returned by `documents` queries.
 */
export interface PostgresDocumentRow {
  document_id: string;
  tenant_id: string;
  title: string;
  source_uri: string;
  mime_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Raw database row structure returned by `document_chunks` queries.
 */
export interface PostgresChunkRow {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: string | null;
  token_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string | Date;
  doc_title?: string;
  source_uri?: string;
  similarity?: number | string;
  score?: number | string;
}

/**
 * Master catalog of static SQL query statements for RAG PostgreSQL storage.
 */
export const RAG_SQL_QUERIES = {
  /**
   * Registers a parent document record.
   */
  INSERT_DOCUMENT: `
    INSERT INTO documents (tenant_id, title, source_uri, mime_type, metadata, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING document_id, tenant_id, title, source_uri, mime_type, metadata, created_at, updated_at;
  `,

  /**
   * Retrieves a document by its primary UUID.
   */
  GET_DOCUMENT_BY_ID: `
    SELECT document_id, tenant_id, title, source_uri, mime_type, metadata, created_at, updated_at
    FROM documents
    WHERE document_id = $1;
  `,

  /**
   * Deletes a document by its primary UUID.
   */
  DELETE_DOCUMENT: `
    DELETE FROM documents
    WHERE document_id = $1;
  `,

  /**
   * Idempotently upserts a document chunk with optional pgvector embedding.
   */
  UPSERT_CHUNK: `
    INSERT INTO document_chunks (document_id, chunk_index, content, embedding, token_count, metadata, created_at)
    VALUES ($1, $2, $3, $4::vector, $5, $6, NOW())
    ON CONFLICT (document_id, chunk_index) DO UPDATE
      SET content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          token_count = EXCLUDED.token_count,
          metadata = EXCLUDED.metadata
    RETURNING chunk_id, document_id, chunk_index, content, embedding::text, token_count, metadata, created_at;
  `,

  /**
   * Retrieves all chunks belonging to a document ordered by index.
   */
  GET_CHUNKS_BY_DOCUMENT: `
    SELECT chunk_id, document_id, chunk_index, content, embedding::text, token_count, metadata, created_at
    FROM document_chunks
    WHERE document_id = $1
    ORDER BY chunk_index ASC;
  `,

  /**
   * Deletes all chunks associated with a parent document.
   */
  DELETE_CHUNKS_BY_DOCUMENT: `
    DELETE FROM document_chunks
    WHERE document_id = $1;
  `,
} as const;

/**
 * Builds a parameterized SQL query for listing documents with dynamic filters.
 *
 * @param filter - Optional tenancy and media type filters
 * @returns SQL statement string and query parameters array
 */
export function buildListDocumentsQuery(filter?: RagFilter): { sql: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter?.tenantId) {
    params.push(filter.tenantId);
    conditions.push(`tenant_id = $${params.length}`);
  }
  if (filter?.mimeType) {
    params.push(filter.mimeType);
    conditions.push(`mime_type = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT document_id, tenant_id, title, source_uri, mime_type, metadata, created_at, updated_at
    FROM documents
    ${where}
    ORDER BY created_at DESC;
  `;

  return { sql, params };
}

/**
 * Builds a parameterized vector search SQL query with optional tenant and MIME filters.
 *
 * @param filter - Tenancy and metadata filter
 * @returns Parameterized SQL statement string
 */
export function buildVectorSearchSql(filter?: RagFilter): string {
  const conditions: string[] = ["c.embedding IS NOT NULL"];

  if (filter?.tenantId) {
    conditions.push(`d.tenant_id = '${filter.tenantId}'`);
  }
  if (filter?.mimeType) {
    conditions.push(`d.mime_type = '${filter.mimeType}'`);
  }

  return `
    SELECT c.chunk_id, c.document_id, c.chunk_index, c.content, c.embedding::text, c.token_count, c.metadata, c.created_at,
           d.title AS doc_title, d.source_uri,
           (1 - (c.embedding <=> $1::vector)) AS similarity
    FROM document_chunks c
    JOIN documents d ON c.document_id = d.document_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY similarity DESC
    LIMIT $2;
  `;
}

/**
 * Builds a parameterized keyword search SQL query with optional tenant filter.
 *
 * @param filter - Tenancy filter
 * @returns Parameterized SQL statement string
 */
export function buildKeywordSearchSql(filter?: RagFilter): string {
  const conditions: string[] = ["c.content ILIKE $1"];

  if (filter?.tenantId) {
    conditions.push(`d.tenant_id = '${filter.tenantId}'`);
  }

  return `
    SELECT c.chunk_id, c.document_id, c.chunk_index, c.content, c.embedding::text, c.token_count, c.metadata, c.created_at,
           d.title AS doc_title, d.source_uri,
           1.0 AS score
    FROM document_chunks c
    JOIN documents d ON c.document_id = d.document_id
    WHERE ${conditions.join(" AND ")}
    LIMIT $2;
  `;
}
