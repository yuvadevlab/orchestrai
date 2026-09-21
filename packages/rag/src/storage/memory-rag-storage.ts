/**
 * @file packages/rag/src/storage/memory-rag-storage.ts
 * @description Thread-safe in-memory storage adapter for RAG documents and vector chunks.
 */

import { randomUUID } from "node:crypto";
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
import { calculateCosineSimilarity } from "./vector-math";
import { matchesRagFilter, scoreKeywordMatch } from "./memory-matchers";

/**
 * Ephemeral in-memory storage adapter implementing dense and sparse retrieval.
 */
export class MemoryRagStorage implements IRagStorage {
  private readonly documents = new Map<string, Document>();
  private readonly chunks = new Map<string, DocumentChunk>();

  async saveDocument(input: CreateDocumentInput, tenantId: string): Promise<Document> {
    const documentId = randomUUID();
    const now = new Date().toISOString();
    const doc: Document = {
      documentId,
      tenantId,
      title: input.title,
      sourceUri: input.sourceUri,
      mimeType: input.mimeType ?? "text/plain",
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(documentId, doc);
    return doc;
  }

  async getDocument(documentId: string): Promise<Document | null> {
    return this.documents.get(documentId) ?? null;
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const existed = this.documents.delete(documentId);
    if (existed) {
      await this.deleteChunks(documentId);
    }
    return existed;
  }

  async listDocuments(filter?: RagFilter): Promise<Document[]> {
    return Array.from(this.documents.values()).filter((doc) => matchesRagFilter(doc, filter));
  }

  async saveChunks(inputs: CreateChunkInput[]): Promise<DocumentChunk[]> {
    const saved: DocumentChunk[] = [];
    const now = new Date().toISOString();
    for (const input of inputs) {
      const chunk: DocumentChunk = {
        chunkId: randomUUID(),
        documentId: input.documentId,
        chunkIndex: input.chunkIndex,
        content: input.content,
        embedding: input.embedding ? [...input.embedding] : undefined,
        tokenCount: input.tokenCount ?? 0,
        metadata: input.metadata ?? {},
        createdAt: now,
      };
      this.chunks.set(chunk.chunkId, chunk);
      saved.push(chunk);
    }
    return saved;
  }

  async getChunks(documentId: string): Promise<DocumentChunk[]> {
    return Array.from(this.chunks.values())
      .filter((c) => c.documentId === documentId)
      .sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  async deleteChunks(documentId: string): Promise<number> {
    let deletedCount = 0;
    for (const [chunkId, chunk] of this.chunks.entries()) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(chunkId);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async vectorSearch(options: VectorSearchOptions): Promise<ScoredDocumentChunk[]> {
    const limit = options.limit ?? 10;
    const minScore = options.minScore ?? 0.0;
    const scored: ScoredDocumentChunk[] = [];

    for (const chunk of this.chunks.values()) {
      const doc = this.documents.get(chunk.documentId);
      if (!doc || !matchesRagFilter(doc, options.filter) || !chunk.embedding) {
        continue;
      }
      const score = calculateCosineSimilarity(options.embedding, chunk.embedding);
      if (score >= minScore) {
        scored.push({
          chunk,
          score,
          documentTitle: doc.title,
          sourceUri: doc.sourceUri,
        });
      }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async keywordSearch(options: KeywordSearchOptions): Promise<ScoredDocumentChunk[]> {
    const limit = options.limit ?? 10;
    const minScore = options.minScore ?? 0.0;
    const scored: ScoredDocumentChunk[] = [];
    const terms = options.query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    for (const chunk of this.chunks.values()) {
      const doc = this.documents.get(chunk.documentId);
      if (!doc || !matchesRagFilter(doc, options.filter)) {
        continue;
      }
      const score = scoreKeywordMatch(chunk.content, terms);
      if (score > 0 && score >= minScore) {
        scored.push({
          chunk,
          score,
          documentTitle: doc.title,
          sourceUri: doc.sourceUri,
        });
      }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async hybridSearch(options: HybridSearchOptions): Promise<ScoredDocumentChunk[]> {
    const alpha = Math.max(0, Math.min(1, options.alpha ?? 0.5));
    const limit = options.limit ?? 10;

    const vectorResults = await this.vectorSearch({
      embedding: options.embedding,
      filter: options.filter,
      limit: limit * 2,
    });
    const keywordResults = await this.keywordSearch({
      query: options.query,
      filter: options.filter,
      limit: limit * 2,
    });

    const merged = new Map<string, ScoredDocumentChunk>();
    for (const vr of vectorResults) {
      merged.set(vr.chunk.chunkId, { ...vr, score: vr.score * alpha });
    }
    for (const kr of keywordResults) {
      const existing = merged.get(kr.chunk.chunkId);
      if (existing) {
        existing.score += kr.score * (1 - alpha);
      } else {
        merged.set(kr.chunk.chunkId, { ...kr, score: kr.score * (1 - alpha) });
      }
    }
    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
