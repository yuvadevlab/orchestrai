/**
 * @file packages/rag/src/storage/postgres-rag-storage.ts
 * @description PostgreSQL and pgvector storage adapter for production RAG pipelines.
 * Delegates SQL query strings to the centralized `postgres-queries` catalog.
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
import {
  RAG_SQL_QUERIES,
  buildListDocumentsQuery,
  buildVectorSearchSql,
  buildKeywordSearchSql,
  type PostgresDocumentRow,
  type PostgresChunkRow,
} from "./postgres-queries";

/**
 * PostgreSQL adapter leveraging pgvector cosine operators and centralized SQL queries.
 */
export class PostgresRagStorage implements IRagStorage {
  constructor(private readonly db: IDatabaseQueryRunner) {}

  async saveDocument(input: CreateDocumentInput, tenantId: string): Promise<Document> {
    const res = await this.db.query<PostgresDocumentRow>(RAG_SQL_QUERIES.INSERT_DOCUMENT, [
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
    const res = await this.db.query<PostgresDocumentRow>(RAG_SQL_QUERIES.GET_DOCUMENT_BY_ID, [
      documentId,
    ]);
    const first = res.rows[0];
    return first ? mapDocumentRow(first) : null;
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const res = await this.db.query(RAG_SQL_QUERIES.DELETE_DOCUMENT, [documentId]);
    return (res.rowCount ?? 0) > 0;
  }

  async listDocuments(filter?: RagFilter): Promise<Document[]> {
    const { sql, params } = buildListDocumentsQuery(filter);
    const res = await this.db.query<PostgresDocumentRow>(sql, params);
    return res.rows.map((r) => mapDocumentRow(r));
  }

  async saveChunks(chunks: CreateChunkInput[]): Promise<DocumentChunk[]> {
    const saved: DocumentChunk[] = [];
    for (const c of chunks) {
      const embeddingStr = c.embedding ? `[${c.embedding.join(",")}]` : null;
      const res = await this.db.query<PostgresChunkRow>(RAG_SQL_QUERIES.UPSERT_CHUNK, [
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
    const res = await this.db.query<PostgresChunkRow>(RAG_SQL_QUERIES.GET_CHUNKS_BY_DOCUMENT, [
      documentId,
    ]);
    return res.rows.map((r) => mapChunkRow(r));
  }

  async deleteChunks(documentId: string): Promise<number> {
    const res = await this.db.query(RAG_SQL_QUERIES.DELETE_CHUNKS_BY_DOCUMENT, [documentId]);
    return res.rowCount ?? 0;
  }

  async vectorSearch(options: VectorSearchOptions): Promise<ScoredDocumentChunk[]> {
    const limit = options.limit ?? 10;
    const minScore = options.minScore ?? 0.0;
    const vectorStr = `[${options.embedding.join(",")}]`;
    const sql = buildVectorSearchSql(options.filter);

    const res = await this.db.query<PostgresChunkRow>(sql, [vectorStr, limit]);
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
    const sql = buildKeywordSearchSql(options.filter);

    const res = await this.db.query<PostgresChunkRow>(sql, [`%${options.query}%`, limit]);
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
