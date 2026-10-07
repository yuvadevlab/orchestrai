# Packages

Modular internal packages forming the reusable domain core of OrchestrAI.

## Package Catalog

| Package                                        | Responsibility                                           | Inward Dependencies                     |
| ---------------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| [`@orchestrai/core`](core)                     | Shared contracts, Zod schemas, branded UUIDs, errors     | None (Zero internal deps)               |
| [`@orchestrai/regex`](regex)                   | Centralized regular expressions & lexical patterns       | None (Zero internal deps)               |
| [`@orchestrai/shared-types`](shared-types)     | Canonical enums, event constants, and system scopes      | `@orchestrai/core`                      |
| [`@orchestrai/database`](database)             | PostgreSQL 16 Prisma ORM, migrations, pool, pgvector     | `@orchestrai/core`                      |
| [`@orchestrai/models`](models)                 | Resilient LLM adapters (Ollama), streaming, tokenization | `@orchestrai/core`, `shared-types`      |
| [`@orchestrai/tools`](tools)                   | Tool execution registry, security sandboxes, path jails  | `@orchestrai/core`, `shared-types`      |
| [`@orchestrai/agent`](agent)                   | Agent loop, state machine, prompt assembly, loop guards  | `@orchestrai/core`, `models`, `tools`   |
| [`@orchestrai/runtime`](runtime)               | Directed StateGraph DAG execution, checkpoints, HITL     | `@orchestrai/core`, `database`, `agent` |
| [`@orchestrai/memory`](memory)                 | 4-tier memory (episodic, fact, preference, task)         | `@orchestrai/core`, `database`          |
| [`@orchestrai/rag`](rag)                       | Document ingestion, chunking, embeddings, hybrid search  | `@orchestrai/core`, `database`          |
| [`@orchestrai/semantic-cache`](semantic-cache) | Cosine similarity vector caching & zero-latency SSE      | `@orchestrai/core`, `database`          |
| [`@orchestrai/model-router`](model-router)     | Real-time empirical latency tracking & routing           | `@orchestrai/core`, `database`          |
| [`@orchestrai/eval`](eval)                     | Automated quality gates, output scoring & throughput     | `@orchestrai/core`, `events`            |
| [`@orchestrai/prompts`](prompts)               | Canonical specialist personas & composite prompts        | `@orchestrai/core`, `shared-types`      |
| [`@orchestrai/billing`](billing)               | Token counting, per-turn budget gates, cost ledger       | `@orchestrai/core`, `database`          |
| [`@orchestrai/resilience`](resilience)         | Circuit breakers, retries, timeouts, bulkheads           | `@orchestrai/core`                      |
| [`@orchestrai/events`](events)                 | Domain event publisher, event bus, outbox pattern        | `@orchestrai/core`, `database`          |
| [`@orchestrai/queue`](queue)                   | BullMQ job producers, priority queues, backpressure      | `@orchestrai/core`                      |
| [`@orchestrai/grpc`](grpc)                     | Protobuf RPC contracts and gRPC client/service layer     | `@orchestrai/core`, `shared-types`      |
| [`@orchestrai/observability`](observability)   | OpenTelemetry tracing, structured JSON logging, metrics  | `@orchestrai/core`                      |
| [`@orchestrai/sdk`](sdk)                       | Client SDK for external integrations and HTTP streaming  | `@orchestrai/core`, `shared-types`      |

## Dependency Rules

1. `@orchestrai/core` is the absolute source of truth with ZERO workspace dependencies.
2. Inward dependency rule: `apps/*` ──▶ `packages/*` ──▶ `@orchestrai/core`.
3. Circular dependencies between packages are strictly forbidden.
