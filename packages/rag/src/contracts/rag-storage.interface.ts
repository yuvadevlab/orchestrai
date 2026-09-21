/**
 * @file packages/rag/src/contracts/rag-storage.interface.ts
 * @description Storage abstraction contract for documents and vector-indexed chunks.
 */

import type { Document, CreateDocumentInput } from "./document.schema";
import type { DocumentChunk, CreateChunkInput, ScoredDocumentChunk } from "./chunk.schema";
import type {
  VectorSearchOptions,
  KeywordSearchOptions,
  HybridSearchOptions,
  RagFilter,
} from "./rag-query.schema";

/**
 * Storage adapter interface for persisting, searching, and managing RAG documents and chunks.
 */
export interface IRagStorage {
  /**
   * Persists a new parent document record under a tenant.
   *
   * @param input - Document creation payload
   * @param tenantId - Tenant isolation identifier
   * @returns Persisted Document entity
   */
  saveDocument(input: CreateDocumentInput, tenantId: string): Promise<Document>;

  /**
   * Retrieves a document by its primary identifier.
   *
   * @param documentId - Document identifier
   * @returns Found Document or null
   */
  getDocument(documentId: string): Promise<Document | null>;

  /**
   * Deletes a document and cascades deletion to all associated chunks.
   *
   * @param documentId - Document identifier
   * @returns True if deleted, false if not found
   */
  deleteDocument(documentId: string): Promise<boolean>;

  /**
   * Lists documents matching optional filters.
   *
   * @param filter - Tenancy and metadata filter
   * @returns List of documents
   */
  listDocuments(filter?: RagFilter): Promise<Document[]>;

  /**
   * Persists an ordered collection of chunks belonging to a document.
   *
   * @param chunks - Array of chunk creation payloads
   * @returns Persisted chunk entities
   */
  saveChunks(chunks: CreateChunkInput[]): Promise<DocumentChunk[]>;

  /**
   * Retrieves all chunks belonging to a specific document ordered by chunkIndex.
   *
   * @param documentId - Parent document identifier
   * @returns Ordered array of chunks
   */
  getChunks(documentId: string): Promise<DocumentChunk[]>;

  /**
   * Deletes all chunks associated with a document.
   *
   * @param documentId - Parent document identifier
   * @returns Number of chunks deleted
   */
  deleteChunks(documentId: string): Promise<number>;

  /**
   * Executes a dense vector similarity search across all indexed chunks.
   *
   * @param options - Vector query embedding and search options
   * @returns Scored chunks ordered by cosine similarity descending
   */
  vectorSearch(options: VectorSearchOptions): Promise<ScoredDocumentChunk[]>;

  /**
   * Executes a lexical/sparse keyword search across stored chunks.
   *
   * @param options - Query text and search options
   * @returns Scored chunks ordered by lexical match relevance descending
   */
  keywordSearch(options: KeywordSearchOptions): Promise<ScoredDocumentChunk[]>;

  /**
   * Executes a hybrid search combining vector similarity and keyword relevance.
   *
   * @param options - Combined vector, query text, and alpha weighting
   * @returns Fused scored chunks ordered by composite score descending
   */
  hybridSearch(options: HybridSearchOptions): Promise<ScoredDocumentChunk[]>;
}
