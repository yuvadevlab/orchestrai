/**
 * @file packages/rag/src/index.ts
 * @description Master entry point for `@orchestrai/rag`.
 * Provides document ingestion, chunking, embeddings, pgvector storage, hybrid search,
 * reranking, and citation-backed context synthesis for OrchestrAI.
 */

export * from "./contracts";
export * from "./ingestion";
export * from "./chunking";
export * from "./embeddings";
export * from "./storage";
export * from "./retrieval";
export * from "./reranking";
export * from "./context";
export * from "./pipeline";
