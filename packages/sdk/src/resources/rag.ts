/**
 * @file packages/sdk/src/resources/rag.ts
 * @description RAG resource managing knowledge document ingestion and hybrid vector retrieval.
 */

import type { RagDocument, RagQueryResult } from "@/types";
import { ResourceBase } from "./resource-base";

export interface IngestDocumentParams {
  title: string;
  sourceUri: string;
  content: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface QueryRagParams {
  query: string;
  limit?: number;
  minScore?: number;
  alpha?: number;
  filter?: {
    documentIds?: string[];
    mimeType?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Resource client for RAG knowledge ingestion and semantic retrieval.
 */
export class RagResource extends ResourceBase {
  /**
   * Submits a document for text extraction, chunking, and vector embedding.
   */
  public async ingest(params: IngestDocumentParams): Promise<RagDocument> {
    return this.http.request<RagDocument>("/api/v1/rag/documents", {
      method: "POST",
      body: params,
    });
  }

  /**
   * Executes a hybrid semantic vector and keyword search query.
   */
  public async query(params: QueryRagParams): Promise<RagQueryResult> {
    return this.http.request<RagQueryResult>("/api/v1/rag/query", {
      method: "POST",
      body: params,
    });
  }
}
