/**
 * @file packages/rag/src/pipeline/rag-pipeline.ts
 * @description Master facade orchestrating end-to-end RAG ingestion, retrieval, and context assembly.
 */

import type { IRagStorage } from "../contracts/rag-storage.interface";
import type { IEmbeddingProvider } from "../embeddings/embedding-provider.interface";
import type { ITextChunker } from "../chunking/chunker.interface";
import type { IReranker } from "../reranking/reranker.interface";
import type { IHybridRetriever } from "../retrieval/hybrid-retriever.types";
import { DocumentIngestor } from "../ingestion/document-ingestor";
import { TextChunker } from "../chunking/text-chunker";
import { MockEmbeddingProvider } from "../embeddings/mock-embedding-provider";
import { MemoryRagStorage } from "../storage/memory-rag-storage";
import { HybridRetriever } from "../retrieval/hybrid-retriever";
import { RelevanceReranker } from "../reranking/relevance-reranker";
import { ContextBuilder } from "../context/context-builder";
import type {
  IngestDocumentOptions,
  IngestDocumentResult,
  QueryRagOptions,
  RagQueryResult,
} from "./rag-pipeline.types";
import type { CreateChunkInput } from "../contracts/chunk.schema";

/**
 * Pluggable dependencies for configuring the RagPipeline.
 */
export interface RagPipelineDependencies {
  storage?: IRagStorage;
  embeddingProvider?: IEmbeddingProvider;
  chunker?: ITextChunker;
  ingestor?: DocumentIngestor;
  hybridRetriever?: IHybridRetriever;
  reranker?: IReranker;
  contextBuilder?: ContextBuilder;
}

/**
 * End-to-end RAG facade managing document ingestion, embeddings, and context synthesis.
 */
export class RagPipeline {
  readonly storage: IRagStorage;
  readonly embeddingProvider: IEmbeddingProvider;
  readonly chunker: ITextChunker;
  readonly ingestor: DocumentIngestor;
  readonly hybridRetriever: IHybridRetriever;
  readonly reranker: IReranker;
  readonly contextBuilder: ContextBuilder;

  constructor(deps: RagPipelineDependencies = {}) {
    this.storage = deps.storage ?? new MemoryRagStorage();
    this.embeddingProvider = deps.embeddingProvider ?? new MockEmbeddingProvider();
    this.chunker = deps.chunker ?? new TextChunker();
    this.ingestor = deps.ingestor ?? new DocumentIngestor();
    this.hybridRetriever = deps.hybridRetriever ?? new HybridRetriever();
    this.reranker = deps.reranker ?? new RelevanceReranker();
    this.contextBuilder = deps.contextBuilder ?? new ContextBuilder();
  }

  /**
   * Ingests, chunks, embeds, and persists a raw document.
   */
  async ingest(
    rawContent: string | Buffer,
    options: IngestDocumentOptions,
  ): Promise<IngestDocumentResult> {
    // 1. Ingest and extract text & metadata
    const payload = await this.ingestor.ingest(rawContent, {
      sourceUri: options.sourceUri,
      title: options.title,
      mimeType: options.mimeType,
      metadata: options.metadata,
    });

    // 2. Persist parent document record
    const document = await this.storage.saveDocument(
      {
        title: payload.title,
        sourceUri: payload.sourceUri,
        mimeType: payload.mimeType,
        metadata: payload.metadata,
      },
      options.tenantId,
    );

    // 3. Segment text into bounded chunks
    const chunkResults = this.chunker.chunk(payload.text, options.chunkOptions);
    if (chunkResults.length === 0) {
      return { document, chunks: [], totalTokens: 0 };
    }

    // 4. Generate batch dense vector embeddings
    const chunkTexts = chunkResults.map((c) => c.content);
    const embeddings = await this.embeddingProvider.embedBatch(chunkTexts);

    // 5. Store chunks with their corresponding vectors
    const chunkInputs: CreateChunkInput[] = chunkResults.map((c, i) => ({
      documentId: document.documentId,
      chunkIndex: c.chunkIndex,
      content: c.content,
      tokenCount: c.tokenCount,
      embedding: embeddings[i],
      metadata: {
        ...payload.metadata,
        startOffset: c.startOffset,
        endOffset: c.endOffset,
      },
    }));

    const savedChunks = await this.storage.saveChunks(chunkInputs);
    const totalTokens = chunkResults.reduce((acc, c) => acc + c.tokenCount, 0);

    return {
      document,
      chunks: savedChunks,
      totalTokens,
    };
  }

  /**
   * Executes hybrid search, candidate reranking, and context prompt synthesis.
   */
  async query(options: QueryRagOptions): Promise<RagQueryResult> {
    const limit = options.limit ?? 10;
    const filter = {
      ...(options.filter ?? {}),
      ...(options.tenantId ? { tenantId: options.tenantId } : {}),
    };

    // 1. Generate query embedding vector
    const queryEmbedding = await this.embeddingProvider.embedText(options.text);

    // 2. Dense vector search
    const vectorCandidates = await this.storage.vectorSearch({
      embedding: queryEmbedding,
      filter,
      limit: limit * 2,
      minScore: options.minScore,
    });

    // 3. Sparse keyword search
    const keywordCandidates = await this.storage.keywordSearch({
      query: options.text,
      filter,
      limit: limit * 2,
    });

    // 4. Fused hybrid retrieval
    const fused = this.hybridRetriever.fuse(vectorCandidates, keywordCandidates, {
      alpha: options.alpha ?? 0.5,
      limit: limit * 2,
    });

    // 5. Candidate reranking
    const reranked = await this.reranker.rerank(options.text, fused, {
      topN: options.topN ?? limit,
      minScore: options.minScore,
    });

    // 6. Build prompt context with citations
    const context = this.contextBuilder.build(reranked, options.contextOptions);

    return {
      context,
      chunks: reranked,
    };
  }

  /**
   * Deletes a document and its associated vector chunks.
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    return this.storage.deleteDocument(documentId);
  }
}
