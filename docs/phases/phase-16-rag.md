# Phase 16: `packages/rag` — RAG & Vector Retrieval Pipeline

## Objectives

Establish the complete Retrieval-Augmented Generation (RAG) and vector retrieval subsystem (`@orchestrai/rag`) for OrchestrAI, providing:

1. **Evolutionary Architecture (Sections 61–63)**:
   - In-monorepo TypeScript package first (`packages/rag`) with clear evolution path to Python microservice (`apps/rag`) if GPU tensor loads or Python OCR require it.
   - Complete end-to-end pipeline: `Document -> Ingestion -> Extraction -> Chunking -> Embedding -> Storage -> Retrieval -> Reranking -> Context -> Agent`.

2. **Domain Contracts & Schemas (`src/contracts/`)**:
   - `document.schema.ts`: Zod schemas for `Document`, `CreateDocumentInput`.
   - `chunk.schema.ts`: `DocumentChunk`, `CreateChunkInput`, and `ScoredDocumentChunk` contracts.
   - `rag-query.schema.ts`: `RagFilter`, `RagSearchQuery`, `VectorSearchOptions`, `KeywordSearchOptions`, and `HybridSearchOptions`.
   - `rag-storage.interface.ts`: `IRagStorage` persistence interface defining document and chunk lifecycle, vector search, keyword search, and hybrid search.

3. **Ingestion & Extraction (`src/ingestion/`)**:
   - `extractor.interface.ts`: `ITextExtractor` and `ExtractedDocument` contracts.
   - `text-extractor.ts`: Extraction for plain text, markdown, csv, and delimited text formats with heading-based title inference.
   - `json-extractor.ts`: Extraction for structured JSON documents with metadata attribute flattening.
   - `document-ingestor.ts`: Multi-format ingestion coordinator with pluggable format fallback.

4. **Chunking & Token Budgeting (`src/chunking/`)**:
   - `chunker.interface.ts`: `ITextChunker`, `ChunkOptions`, and `TextChunkResult`.
   - `token-estimator.ts`: Fast zero-dependency token count estimator (~4 chars/token and word boundaries).
   - `text-chunker.ts`: Boundary-aware sliding-window chunker with sentence/paragraph splitting and configurable token overlap.

5. **Embedding Providers (`src/embeddings/`)**:
   - `embedding-provider.interface.ts`: `IEmbeddingProvider` contract (`dimension`, `embedText`, `embedBatch`).
   - `mock-embedding-provider.ts`: Deterministic, unit-normalized 1536-dimensional embedding provider for reproducible testing and offline development.
   - `ollama-embedding-provider.ts`: HTTP client connecting to local or remote Ollama instances (`/api/embed` and `/api/embeddings`) with timeout and error handling.

6. **Storage Backends (`src/storage/`)**:
   - `vector-math.ts`: Pure cosine similarity calculation between float arrays.
   - `database-runner.interface.ts`: Decoupled `IDatabaseQueryRunner` contract.
   - `memory-rag-storage.ts`: Thread-safe in-memory vector & lexical storage adapter with cosine vector search and keyword matching.
   - `memory-matchers.ts`: In-memory tenancy filtering and term density scorers.
   - `postgres-rag-storage.ts`: PostgreSQL storage adapter targeting `documents` and `document_chunks` with pgvector `<=>` cosine distance.
   - `postgres-row-mappers.ts`: Type-safe row mapping functions for database rows.

7. **Hybrid Retrieval & Reranking (`src/retrieval/` & `src/reranking/`)**:
   - `retrieval/hybrid-retriever.ts`: Reciprocal Rank Fusion (RRF, $k=60$) and linear interpolation score fusion combining dense vectors and sparse keywords.
   - `reranking/relevance-reranker.ts`: Multi-factor relevance reranking combining semantic similarity, lexical density, and document diversity penalties.

8. **Context Construction & Citations (`src/context/`)**:
   - `context-builder.types.ts`: `ContextCitation`, `ContextBuildOptions`, and `FormattedContext`.
   - `context-builder.ts`: Assembles ranked chunks into prompt-ready markdown context strings with structured citations (e.g. `[1] Source: "Title" ...`) and token budget enforcement.

9. **Unified Master Facade (`src/pipeline/`)**:
   - `rag-pipeline.ts`: End-to-end facade orchestrating `ingest(rawContent, options)`, `query(options)`, and document lifecycle.

---

## Directory Structure

```text
packages/rag/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
└── src/
    ├── contracts/
    │   ├── document.schema.ts
    │   ├── chunk.schema.ts
    │   ├── rag-query.schema.ts
    │   ├── rag-storage.interface.ts
    │   └── index.ts
    ├── ingestion/
    │   ├── extractor.interface.ts
    │   ├── text-extractor.ts
    │   ├── json-extractor.ts
    │   ├── document-ingestor.ts
    │   └── index.ts
    ├── chunking/
    │   ├── chunker.interface.ts
    │   ├── token-estimator.ts
    │   ├── text-chunker.ts
    │   └── index.ts
    ├── embeddings/
    │   ├── embedding-provider.interface.ts
    │   ├── mock-embedding-provider.ts
    │   ├── ollama-embedding-provider.ts
    │   └── index.ts
    ├── storage/
    │   ├── vector-math.ts
    │   ├── database-runner.interface.ts
    │   ├── memory-matchers.ts
    │   ├── memory-rag-storage.ts
    │   ├── postgres-row-mappers.ts
    │   ├── postgres-rag-storage.ts
    │   └── index.ts
    ├── retrieval/
    │   ├── hybrid-retriever.types.ts
    │   ├── hybrid-retriever.ts
    │   └── index.ts
    ├── reranking/
    │   ├── reranker.interface.ts
    │   ├── relevance-reranker.ts
    │   └── index.ts
    ├── context/
    │   ├── context-builder.types.ts
    │   ├── context-builder.ts
    │   └── index.ts
    ├── pipeline/
    │   ├── rag-pipeline.types.ts
    │   ├── rag-pipeline.ts
    │   └── index.ts
    └── index.ts
```

---

## Verification & Invariants

- **Prime Invariant 1 (250-Line Rule)**: All 29 files in `packages/rag/src/` are strictly < 180 lines (longest file is `memory-rag-storage.ts` at 178 lines).
- **Prime Invariant 2 (JSDoc & Rationale)**: Comprehensive JSDoc on all exported symbols; inline rationale comments on all conditionals, boundary segmentations, and score computations.
- **Prime Invariant 3 (Package Boundaries)**: Clean inward dependencies on `@orchestrai/shared-types`, `@orchestrai/core`, and `@orchestrai/logger`.
- **Testing Policy**: 0 test cases added per user directive.
- **Quality Gates**: `pnpm --filter @orchestrai/rag build` (ESM, CJS, DTS clean), repo-wide `pnpm typecheck` (23 of 23 projects passing), `pnpm lint` (0 errors, 0 warnings with `--max-warnings=0`), and monorepo `pnpm build` (14 of 14 packages passing).
