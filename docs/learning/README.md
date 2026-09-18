# Learning Log

This directory tracks the engineering and architectural concepts learned throughout building OrchestrAI.

## Concept Tracks

| Track                         | Key Concepts                                                               | Phase        |
| ----------------------------- | -------------------------------------------------------------------------- | ------------ |
| **Monorepo & Build Systems**  | pnpm workspaces, Turborepo caching, TypeScript project references          | Phase 0      |
| **Domain Modeling**           | Invariant domain contracts, Zod runtime validation, JSON Schema generation | Phase 1      |
| **LLM Orchestration**         | Prompt templating, streaming parsers, tool calling, model fallback         | Phase 2–4    |
| **Stateful Graph Execution**  | LangGraph, state checkpointers, rewindability, graph branching             | Phase 5, 10  |
| **Asynchronous Workflows**    | BullMQ job scheduling, backpressure, idempotency, dead-letter queues       | Phase 7, 8   |
| **Event-Driven Architecture** | Transactional outbox pattern, pub/sub broadcasting, event ordering         | Phase 9, 22  |
| **Vector Search & RAG**       | Text chunking, pgvector HNSW indexing, hybrid BM25 + dense retrieval       | Phase 16     |
| **Distributed Systems**       | Circuit breakers, distributed locks, graceful degradation, OTel tracing    | Phase 19, 20 |
