/**
 * @file packages/rag/src/storage/postgres-rag-storage.ts
 * @description PostgreSQL and pgvector storage adapter for production RAG pipelines.
 */

import { RagError } from "@orchestrai/core";
import type {
  IRagStorage,
  Document,
  CreateDocumentInput,
  DocumentChunk,
  CreateChunkInput,
  ScoredDocumentChunk,
  VectorSearchOptions,
  KeywordSearchOptions,
  HybridSearchOptions,
  RagFilter,
} from "../contracts";
import type { IDatabaseQueryRunner } from "./database-runner.interface";
import { mapDocumentRow, mapChunkRow } from "./postgres-row-mappers";

/**
 * PostgreSQL adapter leveraging pgvector cosine operators and relational schemas.
 */
export class PostgresRagStorage implements IRagStorage {
  constructor(private readonly db: IDatabaseQueryRunner) {}

  async saveDocument(input: CreateDocumentInput, tenantId: string): Promise<Document> {
    const sql = `
      INSERT INTO documents (tenant_id, title, source_uri, mime_type, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING document_id, tenant_id, title, source_uri, mime_type, metadata, created_at, updated_at
    `;
    const res = await this.db.query<Record<string, unknown>>(sql, [
      tenantId,
      input.title,
      input.sourceUri,
      input.mimeType ?? "text/plain",
      JSON.stringify(input.metadata ?? {}),
    ]);
    const first = res.rows[0];
    if (!first) {
      throw new RagError("Failed to persist document: empty result row from database");
    }
    return mapDocumentRow(first);
  }

  async getDocument(documentId: string): Promise<Document | null> {
    const sql = `SELECT * FROM documents WHERE document_id = $1`;
    const res = await this.db.query<Record<string, unknown>>(sql, [documentId]);
    const first = res.rows[0];
    return first ? mapDocumentRow(first) : null;
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const sql = `DELETE FROM documents WHERE document_id = $1`;
    const res = await this.db.query(sql, [documentId]);
    return (res.rowCount ?? 0) > 0;
  }

  async listDocuments(filter?: RagFilter): Promise<Document[]> {
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
    const sql = `SELECT * FROM documents ${where} ORDER BY created_at DESC`;
    const res = await this.db.query<Record<string, unknown>>(sql, params);
    return res.rows.map((r) => mapDocumentRow(r));
  }

  async saveChunks(chunks: CreateChunkInput[]): Promise<DocumentChunk[]> {
    const saved: DocumentChunk[] = [];
    for (const c of chunks) {
      const embeddingStr = c.embedding ? `[${c.embedding.join(",")}]` : null;
      const sql = `
        INSERT INTO document_chunks (document_id, chunk_index, content, embedding, token_count, metadata, created_at)
        VALUES ($1, $2, $3, $4::vector, $5, $6, NOW())
        ON CONFLICT (document_id, chunk_index) DO UPDATE
          SET content = EXCLUDED.content, embedding = EXCLUDED.embedding, token_count = EXCLUDED.token_count, metadata = EXCLUDED.metadata
        RETURNING chunk_id, document_id, chunk_index, content, embedding::text, token_count, metadata, created_at
      `;
      const res = await this.db.query<Record<string, unknown>>(sql, [
        c.documentId,
        c.chunkIndex,
        c.content,
        embeddingStr,
        c.tokenCount ?? 0,
        JSON.stringify(c.metadata ?? {}),
      ]);
      const first = res.rows[0];
      if (first) {
        saved.push(mapChunkRow(first));
      }
    }
    return saved;
  }

  async getChunks(documentId: string): Promise<DocumentChunk[]> {
    const sql = `SELECT chunk_id, document_id, chunk_index, content, embedding::text, token_count, metadata, created_at
                 FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC`;
    const res = await this.db.query<Record<string, unknown>>(sql, [documentId]);
    return res.rows.map((r) => mapChunkRow(r));
  }

  async deleteChunks(documentId: string): Promise<number> {
    const sql = `DELETE FROM document_chunks WHERE document_id = $1`;
    const res = await this.db.query(sql, [documentId]);
    return res.rowCount ?? 0;
  }

  async vectorSearch(options: VectorSearchOptions): Promise<ScoredDocumentChunk[]> {
    const limit = options.limit ?? 10;
    const minScore = options.minScore ?? 0.0;
    const vectorStr = `[${options.embedding.join(",")}]`;
    const sql = `
      SELECT c.chunk_id, c.document_id, c.chunk_index, c.content, c.embedding::text, c.token_count, c.metadata, c.created_at,
             d.title AS doc_title, d.source_uri,
             (1 - (c.embedding <=> $1::vector)) AS similarity
      FROM document_chunks c
      JOIN documents d ON c.document_id = d.document_id
      WHERE c.embedding IS NOT NULL
        ${options.filter?.tenantId ? `AND d.tenant_id = '${options.filter.tenantId}'` : ""}
        ${options.filter?.mimeType ? `AND d.mime_type = '${options.filter.mimeType}'` : ""}
      ORDER BY similarity DESC
      LIMIT $2
    `;
    const res = await this.db.query<Record<string, unknown>>(sql, [vectorStr, limit]);
    return res.rows
      .map((r) => ({
        chunk: mapChunkRow(r),
        score: Number(r.similarity ?? 0),
        documentTitle: String(r.doc_title ?? ""),
        sourceUri: String(r.source_uri ?? ""),
      }))
      .filter((s) => s.score >= minScore);
  }

  async keywordSearch(options: KeywordSearchOptions): Promise<ScoredDocumentChunk[]> {
    const limit = options.limit ?? 10;
    const sql = `
      SELECT c.chunk_id, c.document_id, c.chunk_index, c.content, c.embedding::text, c.token_count, c.metadata, c.created_at,
             d.title AS doc_title, d.source_uri, 1.0 AS score
      FROM document_chunks c
      JOIN documents d ON c.document_id = d.document_id
      WHERE c.content ILIKE $1
        ${options.filter?.tenantId ? `AND d.tenant_id = '${options.filter.tenantId}'` : ""}
      LIMIT $2
    `;
    const res = await this.db.query<Record<string, unknown>>(sql, [`%${options.query}%`, limit]);
    return res.rows.map((r) => ({
      chunk: mapChunkRow(r),
      score: Number(r.score ?? 1.0),
      documentTitle: String(r.doc_title ?? ""),
      sourceUri: String(r.source_uri ?? ""),
    }));
  }

  async hybridSearch(options: HybridSearchOptions): Promise<ScoredDocumentChunk[]> {
    return this.vectorSearch({
      embedding: options.embedding,
      filter: options.filter,
      limit: options.limit,
    });
  }
}
