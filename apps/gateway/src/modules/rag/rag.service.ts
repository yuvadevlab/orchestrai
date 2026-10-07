/**
 * @file apps/gateway/src/services/rag.service.ts
 * @description Domain service for managing document ingestion and vector retrieval queries.
 * @module apps/gateway/services
 */

import {
  RagPipeline,
  MemoryRagStorage,
  MockEmbeddingProvider,
  OllamaEmbeddingProvider,
  type IEmbeddingProvider,
} from "@orchestrai/rag";
import type { IngestDocumentDto, QueryRagDto } from "@/validation";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("RagService"));

export interface IngestedDocumentResult {
  documentId: string;
  tenantId: string;
  title: string;
  sourceUri: string;
  mimeType: string;
  status: "INGESTED";
  createdAt: string;
}

export interface RagQueryResult {
  query: string;
  tenantId: string;
  context?: string;
  chunks: Array<{
    chunkId: string;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
  }>;
  total: number;
}

/**
 * Composite embedding provider that tries Ollama first with transparent fallback to deterministic mock embeddings.
 */
export class ResilientEmbeddingProvider implements IEmbeddingProvider {
  readonly dimension: number;
  private readonly primary: OllamaEmbeddingProvider;
  private readonly fallback: MockEmbeddingProvider;

  constructor() {
    const dimension = 1536;
    this.dimension = dimension;
    this.primary = new OllamaEmbeddingProvider({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.EMBEDDING_MODEL_NAME || "nomic-embed-text",
      dimension,
      timeoutMs: 5000,
    });
    this.fallback = new MockEmbeddingProvider(dimension);
  }

  async embedText(text: string): Promise<number[]> {
    try {
      return await this.primary.embedText(text);
    } catch {
      logger.debug("Falling back to local deterministic embedding provider for text");
      return this.fallback.embedText(text);
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      return await this.primary.embedBatch(texts);
    } catch {
      logger.debug("Falling back to local deterministic embedding provider for batch");
      return this.fallback.embedBatch(texts);
    }
  }
}

/**
 * Service encapsulating RAG ingestion tasks and semantic vector queries.
 */
export class RagService {
  private readonly pipeline: RagPipeline;

  constructor() {
    this.pipeline = new RagPipeline({
      storage: new MemoryRagStorage(),
      embeddingProvider: new ResilientEmbeddingProvider(),
    });
  }

  /**
   * Enqueues document ingestion for chunking and vector storage.
   */
  public async ingestDocument(
    dto: IngestDocumentDto,
    tenantId: string,
  ): Promise<IngestedDocumentResult> {
    const res = await this.pipeline.ingest(dto.content, {
      title: dto.title,
      sourceUri: dto.sourceUri,
      mimeType: dto.mimeType,
      metadata: dto.metadata,
      tenantId,
    });

    return {
      documentId: res.document.documentId,
      tenantId,
      title: res.document.title,
      sourceUri: res.document.sourceUri,
      mimeType: res.document.mimeType,
      status: "INGESTED",
      createdAt: res.document.createdAt,
    };
  }

  /**
   * Executes semantic vector retrieval query.
   */
  public async query(dto: QueryRagDto, tenantId: string): Promise<RagQueryResult> {
    const res = await this.pipeline.query({
      text: dto.query,
      tenantId,
      limit: dto.limit,
      minScore: dto.minScore,
      alpha: dto.alpha,
      filter: dto.filter,
    });

    const chunks = res.chunks.map((c) => ({
      chunkId: c.chunk.chunkId,
      content: c.chunk.content,
      score: c.score,
      metadata: c.chunk.metadata,
    }));

    return {
      query: dto.query,
      tenantId,
      context: res.context.contextText,
      chunks,
      total: chunks.length,
    };
  }

  /**
   * Lists all ingested documents for a tenant.
   */
  public async listDocuments(tenantId: string): Promise<unknown[]> {
    return this.pipeline.storage.listDocuments({ tenantId });
  }

  /**
   * Deletes an ingested document and its vector chunks by ID.
   */
  public async deleteDocument(documentId: string): Promise<boolean> {
    return this.pipeline.storage.deleteDocument(documentId);
  }
}

export const ragService = new RagService();
