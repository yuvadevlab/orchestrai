# OrchestrAI System Architecture

## 1. System Overview

OrchestrAI is an enterprise-grade, local-first platform for autonomous and human-in-the-loop AI agent orchestration. It bridges the gap between simple prompt wrappers and resilient, distributed execution engines.

The platform is designed around seven core pillars:

1. **Stateful Graph Execution**: Agents operate as state machines with checkpointed transitions, rewindability, and branching.
2. **Local-First Foundations**: Complete system functions offline using PostgreSQL + pgvector, Redis, and local Ollama models.
3. **Strict Contract Boundaries**: Domain schemas and types in `@orchestrai/core` enforce invariant correctness across services.
4. **Resilient Intelligence**: Composable circuit breakers, retries, timeouts, and bulkheads wrap every LLM turn.
5. **Human-in-the-Loop Safeguards**: High-risk tool calls (filesystem, network, database writes) trigger interactive pauses awaiting operator clearance.
6. **Multi-Tier Context & Memory**: Working, episodic, fact, preference, and task memories distill automatically across sessions.
7. **Polyglot Intelligence Sidecars**: TypeScript orchestrates ingress, auth, and state machines; Python LangGraph and Playwright handle complex reasoning and deep web scraping.

---

## 2. Core Subsystems

```text
               ┌────────────────────────────────────────────────────────┐
               │        Operator Studio / Console (apps/console - 3001) │
               └───────────────────────────┬────────────────────────────┘
                                           │ HTTP / SSE / WS
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                 API Gateway (apps/gateway - 4001)      │
               │  - REST & WebSocket Ingress, Auth, Semantic Cache      │
               │  - Token Counting, Budget Gate, Model Router           │
               └───────────┬───────────────────┬────────────────┬───────┘
                           │                   │                │
            gRPC / HTTP    ▼                   ▼                ▼
┌───────────────────────────────┐  ┌────────────────┐  ┌────────────────┐
│  apps/intelligence (Port 8082)│  │ apps/realtime  │  │  apps/worker   │
│  - Python LangGraph StateGraph│  │ (Port 4002)    │  │  (Port 4003)   │
│  - Conversational RAG Pruning │  │ - SSE Broker   │  │  - BullMQ Queue│
└──────────────┬────────────────┘  └───────┬────────┘  └───────┬────────┘
               │                           │                   │
               ▼                           ▼                   ▼
┌───────────────────────────────┐  ┌────────────────────────────────────┐
│    apps/crawler (Port 8083)   │  │  apps/orchestrator (gRPC 50051)    │
│  - Playwright Headless Browser│  │  - StateGraph DAG Execution Engine │
│  - Semantic RAG Ingestion     │  │  - Durable PostgreSQL Checkpointer │
└──────────────┬────────────────┘  └───────────────┬────────────────────┘
               │                                   │
               └─────────────────┬─────────────────┘
                                 │
                                 ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       Domain Packages Layer                           │
│                                                                       │
│  @orchestrai/agent          ──▶  @orchestrai/runtime                  │
│  @orchestrai/memory         ──▶  @orchestrai/rag                      │
│  @orchestrai/semantic-cache ──▶  @orchestrai/model-router             │
│  @orchestrai/eval           ──▶  @orchestrai/prompts                  │
│  @orchestrai/billing        ──▶  @orchestrai/resilience               │
│  @orchestrai/events         ──▶  @orchestrai/queue                    │
│  @orchestrai/grpc           ──▶  @orchestrai/observability            │
│  @orchestrai/tools          ──▶  @orchestrai/models                   │
│                                │                                      │
│                                ▼                                      │
│                   @orchestrai/core (Shared Contracts)                 │
└────────────────────────────────┬──────────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│     PostgreSQL + pgvector   │         │       Redis (Queue / PubSub)│
│  (State Checkpoints, RAG)   │         │   (BullMQ, Ephemeral Cache) │
└─────────────────────────────┘         └─────────────────────────────┘
```

---

## 3. Data Flow & Execution Lifecycle

```text
1. CLIENT REQUEST & INGRESS
   └─▶ Gateway receives HTTP POST /executions/stream with user prompt
   └─▶ Authenticates tenant JWT / API key and parses schema via @orchestrai/core

2. SEMANTIC CACHE LOOKUP
   └─▶ @orchestrai/semantic-cache computes embedding vector
   └─▶ If cosine similarity > 0.97: returns instant cached SSE completion (0 ms latency)

3. BUDGET GATE & MODEL ROUTING
   └─▶ @orchestrai/billing evaluates budget ceiling and token balance
   └─▶ @orchestrai/model-router selects model via live empirical latency quantiles

4. CONVERSATIONAL RAG & MEMORY RECALL
   └─▶ @orchestrai/memory retrieves 4-tier memories (preferences, facts, episodes)
   └─▶ @orchestrai/rag queries top-3 knowledge base chunks
   └─▶ apps/intelligence selectively injects relevant turns, pruning old history

5. RESILIENT REASONING TURN
   └─▶ Wrapped in @orchestrai/resilience (circuit breaker, retries, 120s deadline)
   └─▶ Dispatches to local Ollama adapter
   └─▶ Emits streaming token deltas to apps/realtime over Redis Pub/Sub

6. TOOL DISPATCH & CLEARANCE
   └─▶ If dangerous action: halts at approval_gate, emits APPROVAL_REQUESTED event
   └─▶ Safe tools execute inside @orchestrai/tools sandboxes
   └─▶ Web scraping delegates to apps/crawler Playwright headless Chromium

7. EVALUATION GATE & MEMORY DISTILLATION
   └─▶ EXECUTION_COMPLETED domain event published
   └─▶ @orchestrai/eval scores completeness, tool veracity, and throughput
   └─▶ Turn summary automatically distills into episodic memory table in PostgreSQL
```

---

## 4. Resilience & Operational Invariants

- **Zero Hardcoded Entities**: All models and agents are 100% database- or env-driven. If unconfigured, the system fails fast with actionable instructions.
- **Strict 250-LOC Boundary**: Every file across apps and packages is decomposed when reaching ~200 lines to preserve single responsibility.
- **Idempotency & Checkpoints**: Every step persists intermediate snapshots via PostgreSQL checkpointer, enabling time-travel rewind and crash recovery.
- **Transactional Outbox**: Events destined for Redis/BullMQ are recorded in the `outbox` table within the same transaction as state updates, eliminating dual-write divergence.
- **Resilience Pipelines**: Circuit breakers open after consecutive failures; retries use exponential backoff with full jitter; bulkheads throttle concurrency.
