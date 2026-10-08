# OrchestrAI — Deep Product & Technical Specification Dossier

## 1. Product Overview & Vision

### 1.1 The Operational Problem Space

Single-agent AI systems (e.g. basic chat wrappers) fail when presented with enterprise-scale software engineering or distributed analytical objectives:

- **Context Window Exhaustion**: A single agent fills its context window with trial-and-error logs, losing track of high-level goals.
- **Uncontrolled Hallucinations**: Without independent verification, agents hallucinate outputs and proceed down invalid execution paths.
- **Fragile State Management**: If a long-running process crashes after 30 minutes, all intermediate progress is lost without durable checkpointing.
- **Dangerous Side-Effects**: Running unsandboxed code directly on host machines risks irreversible data loss or security compromise.

### 1.2 The OrchestrAI Solution

OrchestrAI is an **Enterprise Distributed AI Agent Orchestration Platform**:

1. **Dynamic Multi-Agent Swarms**: Decomposes monolithic tasks into Directed Acyclic Graphs (DAGs) executed by specialized, role-bounded agents.
2. **Durable StateGraph Checkpointing**: Built on LangGraph state machines and PostgreSQL persistence, enabling resilient recovery and time-travel debugging.
3. **Multi-Tier Memory Architecture**: Combines working memory, episodic session memory, and hybrid dense-sparse vector RAG (pgvector).
4. **Sandboxed Capability Harnesses**: Enforces capability permissions (`NETWORK`, `FILESYSTEM`, `DATABASE`) and isolated container execution.
5. **Real-Time Streaming Bus**: Streams tokens, tool call previews, and DAG state updates to the Operator Studio via SSE and WebSockets.

---

## 2. Technical Stack & Architectural Rationale

### 2.1 Language Breakdown: Polyglot by Design

| Subsystem                                   | Language & Runtime                    | Why Selected                                                                                                             |
| :------------------------------------------ | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| **Gateway, Worker, Console, Core Packages** | **TypeScript 5.8 (Node.js ESM)**      | Strict type safety, shared Zod contracts with `@yuva-devlab/shared`, and high-concurrency event loops for streaming I/O. |
| **Intelligence Engine**                     | **Python 3.12 (FastAPI / LangGraph)** | Native LangGraph framework, PyTorch ecosystem, and vector mathematical libraries.                                        |
| **Crawler Service**                         | **TypeScript + Playwright**           | Headless browser automation for deep web research and live documentation indexing.                                       |

---

### 2.2 Storage, Queues & Distributed Infrastructure

| Component                   | Selected Technology          | Why Selected Over Alternatives                                                                                                          |
| :-------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Durable State & Memory**  | **PostgreSQL + pgvector**    | ACID relational transactions for execution runs and checkpoints; HNSW vector indexes for semantic embeddings in a single unified store. |
| **Task Queue & Scheduling** | **BullMQ + Redis**           | High-throughput distributed background job queue with delayed tasks, parent-child job hierarchies, and worker backpressure.             |
| **Streaming & Pub/Sub**     | **Redis Pub/Sub + SSE**      | Low-latency real-time token streaming to web dashboards without WebSocket connection bloat.                                             |
| **Event Bus & Idempotency** | **Apache Kafka (Dual-Mode)** | Event sourcing and transactional outbox relay guarantees zero event loss between services.                                              |
| **Monorepo Build Engine**   | **Turborepo**                | Coordinates 25+ packages and 6 applications with dependency-aware pipeline scheduling and remote caching.                               |

---

## 3. Structural & Architectural Design

```
orchestrai/
├── apps/
│   ├── console/                # Operator Studio (Next.js 15)
│   ├── gateway/                # Fastify API Gateway (Auth, Rate Limiting, Router)
│   ├── intelligence/           # Python LangGraph & Conversational RAG service
│   ├── realtime/               # Server-Sent Events (SSE) & WebSocket stream rail
│   ├── worker/                 # BullMQ distributed execution worker
│   └── crawler/                # Playwright headless documentation scraper
├── packages/
│   ├── core/                   # Absolute source of truth with zero dependencies
│   ├── shared-types/           # Canonical domain types and enums
│   ├── agent/                  # Agent loop, state transitions, tool runners
│   ├── runtime/                # LangGraph node execution adapters
│   ├── models/                 # Multi-provider model client adapters (Ollama, Claude, OpenAI)
│   ├── tools/                  # Sandboxed tool definitions & capability harnesses
│   ├── memory/                 # Multi-tier working and episodic memory
│   ├── rag/                    # Vector retrieval, chunking, and ranking
│   ├── database/               # Prisma client and PostgreSQL schema
│   ├── queue/                  # BullMQ job producers and queue configurations
│   ├── events/                 # Event bus, outbox pattern, and idempotency
│   └── observability/          # OpenTelemetry spans, Prometheus metrics, and tracing
├── .agents/                    # Specialized AI agent roles & core invariants
└── turbo.json                  # Turborepo task definitions
```

---

## 4. Prime Non-Negotiable Invariants

1. **Hard 250-Line Maximum Rule**: Every file across all apps and packages must strictly remain under 250 lines. Decompose early at 200 lines.
2. **Zero Hardcoded Strings & Models**: Domain statuses, roles, and event types must reference canonical enums in `@orchestrai/shared-types`. All models must be dynamically resolved.
3. **Strict Package Boundaries**: `@orchestrai/core` has ZERO internal workspace dependencies.
