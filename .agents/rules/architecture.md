# Architecture Principles & Invariants

## 1. Modular Monorepo with Evolutionary Extraction

- The platform starts as a single monorepo (`apps/*`, `packages/*`) using pnpm workspaces.
- Package boundaries must be maintained cleanly so any package (`@orchestrai/sdk`, `@orchestrai/models`, `@orchestrai/tools`) can be published to npm or extracted into a standalone repo without structural rewrites.

## 2. Dependency Flow Hierarchy

```text
Apps (gateway, worker, realtime, console)
  │
  ▼
Domain Packages (agent, runtime, memory, rag, queue, events)
  │
  ▼
Infrastructure Adapters (models, tools, observability)
  │
  ▼
Core Contracts (@orchestrai/core)
```

- **Rule**: Upward or circular imports between layers are strictly forbidden.
- `@orchestrai/core` contains only domain types, Zod schemas, error definitions, and interface declarations. It has NO runtime dependencies on database, Redis, or external APIs.

## 3. Local-First Engineering

- Every component must run locally on developer hardware using Docker Compose.
- Base stack:
  - Storage & Vector: PostgreSQL 16+ with pgvector
  - Cache & Queues: Redis 7+ with BullMQ
  - Local LLM: Ollama (Llama 3, Mistral, Qwen, DeepSeek)
  - Reverse Proxy: Nginx
- Cloud services (Anthropic, OpenAI, AWS S3, Pinecone) are strictly optional adapters behind interfaces.

## 4. State & Resilience Guarantees

- Agent executions are stateful, checkpointed state machines (LangGraph).
- Tool invocations must be auditable, permission-checked, and safely sandboxable.
- Distributed events utilize the transactional outbox pattern to prevent lost messages between PostgreSQL and Redis/Kafka.
- Long-running executions run via background queue workers with heartbeat and dead-letter queues.
