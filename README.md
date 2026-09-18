# OrchestrAI

> A reusable, local-first AI agent platform designed for stateful agent orchestration, tool execution, memory, RAG, realtime streaming, event-driven workflows, background processing, evaluation, and observability.

---

## High-Level Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │              Operator UI / Console (Next.js)           │
               └───────────────────────────┬────────────────────────────┘
                                           │ HTTP / SSE / WS
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                   API Gateway (Port 4000)              │
               │        (Auth, Rate Limiting, Request Validation)       │
               └───────────┬────────────────────────────────┬───────────┘
                           │                                │
                           ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       Realtime Streamer (Port 4001)  │  │        BullMQ Worker Engine          │
│    (SSE / WebSocket Execution Rail)  │  │   (Background State Transitions)     │
└──────────────────┬───────────────────┘  └──────────────────┬───────────────────┘
                   │                                         │
                   └───────────────────┬─────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           Domain Packages Layer                                │
│                                                                                │
│  @orchestrai/agent   ──▶  @orchestrai/runtime  ──▶  @orchestrai/tools          │
│  @orchestrai/memory  ──▶  @orchestrai/rag      ──▶  @orchestrai/models         │
│  @orchestrai/events  ──▶  @orchestrai/queue    ──▶  @orchestrai/observability  │
│                                      │                                         │
│                                      ▼                                         │
│                          @orchestrai/core (Contracts)                          │
└────────────────────────────────────────────────────────────────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
    ┌─────────────────────────────┐         ┌─────────────────────────────┐
    │     PostgreSQL + pgvector   │         │       Redis (Queue / PubSub)│
    │  (State Checkpoints, RAG)   │         │   (BullMQ, Ephemeral Cache) │
    └─────────────────────────────┘         └─────────────────────────────┘
```

---

## Monorepo Layout

```text
orchestrai/
├── apps/                    # Deployable services
│   ├── gateway/             # Ingress API (REST, WebSocket, SSE)
│   ├── worker/              # Background execution engine
│   ├── realtime/            # Streaming event broker
│   └── console/             # Operator UI (Next.js / Vite)
├── packages/                # Reusable domain packages
│   ├── core/                # Shared contracts, Zod schemas, errors
│   ├── models/              # Model adapters (Ollama, Anthropic, OpenAI)
│   ├── tools/               # Tool registry, permissions & sandboxing
│   ├── agent/               # Agent loop, state machine & modes
│   ├── runtime/             # LangGraph stateful execution & checkpoints
│   ├── queue/               # BullMQ producers & priority scheduling
│   ├── events/              # Event bus & outbox pattern
│   ├── memory/              # Short, episodic & semantic memory
│   ├── rag/                 # Chunking, vector indexing & retrieval
│   ├── observability/       # OpenTelemetry, metrics & JSON logging
│   └── sdk/                 # Client library for integrations
├── infrastructure/          # Docker compose, DB init, local models
├── docs/                    # Architecture, ADRs, learning notes, phase guides
├── .agents/                 # AI agent rules, continuity, and skill definitions
├── PROGRESS.md              # Live implementation tracker
└── IMPLEMENTATION-LOG.md    # Completed work history
```

---

## Tech Stack

- **Monorepo Engine**: [pnpm](https://pnpm.io/) workspaces + [Turborepo](https://turbo.build/)
- **Language**: TypeScript (strict mode, NodeNext module resolution)
- **Local Persistence**: PostgreSQL 16+ with [pgvector](https://github.com/pgvector/pgvector)
- **Queueing & Pub/Sub**: Redis 7+ with [BullMQ](https://bullmq.io/)
- **Local AI Models**: [Ollama](https://ollama.com/) (Llama 3, Mistral, Qwen, DeepSeek)
- **Agent Orchestration**: LangGraph state machine & custom runtime
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## Getting Started

### Prerequisites

- Node.js >= 20 (v24 recommended, see `.nvmrc`)
- pnpm >= 9 (11.x recommended)
- Docker Desktop or Docker Engine

### Quick Setup

```bash
# 1. Install dependencies across workspace
pnpm install

# 2. Start local infrastructure (Postgres, Redis, Ollama)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 3. Run typecheck across all packages
pnpm typecheck

# 4. Start development mode
pnpm dev
```

---

## AI Agent Development Guidelines

AI coding assistants (Antigravity, Claude, Copilot, Cursor) must follow the protocols defined in:

- [`.agents/AGENTS.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/.agents/AGENTS.md) — Master instructions
- [`.agents/rules/session-continuity.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/.agents/rules/session-continuity.md) — Session handoff rules
- [`PROGRESS.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/PROGRESS.md) — Live phase tracking
- [`docs/architecture/ARCHITECTURE.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/docs/architecture/ARCHITECTURE.md) — Architectural invariants
