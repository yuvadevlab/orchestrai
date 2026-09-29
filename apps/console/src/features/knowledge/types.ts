/**
 * @file apps/console/src/features/knowledge/types.ts
 * @description Type definitions for RAG Knowledge Base documents, vector chunks, and search queries.
 * @module apps/console/features/knowledge
 */

export interface KnowledgeDocument {
  documentId: string;
  tenantId: string;
  title: string;
  sourceUri: string;
  mimeType: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface IngestDocumentPayload {
  title: string;
  sourceUri: string;
  mimeType: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeChunkResult {
  chunkId: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface KnowledgeQueryResult {
  query: string;
  tenantId: string;
  context?: string;
  chunks: KnowledgeChunkResult[];
  total: number;
}
