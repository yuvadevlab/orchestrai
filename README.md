# OrchestrAI

> A reusable, local-first AI agent platform designed for stateful agent orchestration, tool execution, memory, RAG, realtime streaming, event-driven workflows, background processing, evaluation, and observability.

---

## High-Level Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │        Operator UI / Console (Next.js - Port 3001)     │
               └───────────────────────────┬────────────────────────────┘
                                           │ HTTP / SSE / WS
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                   API Gateway (Port 4001)              │
               │        (Auth, Rate Limiting, Request Validation)       │
               └───────────┬────────────────────────────────┬───────────┘
                           │                                │
                           ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       Realtime Streamer (Port 4002)  │  │        BullMQ Worker Engine          │
│    (SSE / WebSocket Execution Rail)  │  │   (Background Diagnostics Port 4003) │
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
├── apps/                    # Deployable applications & gateways
│   ├── console/             # Autonomous Cowork Studio (Next.js 15)
│   ├── gateway/             # Ingress API (REST, WebSocket, SSE)
│   ├── realtime/            # Streaming event broker & fan-out
│   └── worker/              # Background task execution engine
├── packages/                # Reusable domain engines & packages
│   ├── core/                # Shared contracts, Zod schemas, errors
│   ├── database/            # Prisma ORM, migrations, connection pool, types
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
├── docs/                    # Architecture, ADRs, learning notes, phase guides
├── .agents/                 # AI agent rules, continuity, and skill definitions
├── PROGRESS.md              # Live implementation tracker
└── IMPLEMENTATION-LOG.md    # Completed work history
```

---

## Tech Stack

- **Monorepo Engine**: [pnpm](https://pnpm.io/) workspaces + [Turborepo](https://turbo.build/)
- **Language**: TypeScript (strict mode, NodeNext module resolution)
- **Database & ORM**: PostgreSQL 16+ via [Prisma](https://www.prisma.io/) + pg pool adapter
- **Queueing & Pub/Sub**: Redis 7+ with [BullMQ](https://bullmq.io/) (with in-memory fallback)
- **Local AI Models**: [Ollama](https://ollama.com/) (Llama 3, Mistral, Qwen, DeepSeek)
- **Agent Orchestration**: Autonomous agent state machine & execution runtime
- **Validation**: [Zod](https://zod.dev/)

---

## Getting Started

### Prerequisites

- Node.js >= 20 (v24 recommended)
- pnpm >= 9 (12.x recommended)
- PostgreSQL 16 (optional: falls back to local embedded store)

### Quick Setup

```bash
# 1. Install dependencies across workspace
pnpm install

# 2. Run database migrations (or auto-falls back to local store)
pnpm db:migrate

# 3. Start development servers
pnpm dev
```

---

## AI Agent Development Guidelines

AI coding assistants (Antigravity, Claude, Copilot, Cursor) must follow the protocols defined in:

- [`.agents/AGENTS.md`](.agents/AGENTS.md) — Master instructions
- [`.agents/rules/session-continuity.md`](.agents/rules/session-continuity.md) — Session handoff rules
- [`PROGRESS.md`](PROGRESS.md) — Live phase tracking
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) — Architectural invariants
