# OrchestrAI

> An enterprise-grade distributed AI agent orchestration platform engineered to handle massive, complex tasks through autonomous multi-agent swarms, sandboxed tool harnesses, multi-tier memory, Conversational RAG, real-time event streaming, and resilient execution DAGs.

---

## High-Level Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │        Operator Studio / Console (Next.js - Port 3001) │
               └───────────────────────────┬────────────────────────────┘
                                           │ HTTP / SSE / WS
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                   API Gateway (Port 4001)              │
               │        (Auth, Rate Limiting, Semantic Cache, Router)   │
               └───────────┬───────────────────┬────────────────┬───────┘
                           │                   │                │
            gRPC / HTTP    ▼                   ▼                ▼
┌───────────────────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Python Intelligence (8082)   │  │ Realtime (4002)│  │  Worker (4003) │
│  (LangGraph + Conv RAG)       │  │ (SSE / WS Rail)│  │ (BullMQ Queue) │
└──────────────┬────────────────┘  └───────┬────────┘  └───────┬────────┘
               │                           │                   │
               ▼                           ▼                   ▼
┌───────────────────────────────┐  ┌────────────────────────────────────┐
│   Playwright Crawler (8083)   │  │   DAG Orchestrator (gRPC 50051)    │
│   (Web Scraping + RAG Ingest) │  │   (StateGraph + Checkpointing)     │
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

## Monorepo Layout

```text
orchestrai/
├── apps/                    # Deployable services, gateways, and sidecars
│   ├── console/             # Operator Studio & Agent Cockpit (Next.js 15)
│   ├── gateway/             # Primary Ingress API (REST, WebSocket, SSE)
│   ├── realtime/            # Streaming event broker & SSE fan-out
│   ├── worker/              # Background task execution engine (BullMQ)
│   ├── orchestrator/        # gRPC Execution Orchestrator & StateGraph runtime
│   ├── admin/               # Backoffice administration & telemetry portal
│   ├── intelligence/        # Python LangGraph reasoning & Conversational RAG
│   └── crawler/             # Python Playwright browser automation & scraper
├── packages/                # Modular domain engines (Zero circular deps)
│   ├── core/                # Canonical domain models, schemas, enums, errors
│   ├── database/            # Prisma ORM, migrations, pool, pgvector
│   ├── models/              # Resilient model adapters (Ollama, streaming)
│   ├── tools/               # Sandboxed tool registry & capability gates
│   ├── agent/               # Agent loop, state machine, and runner resolver
│   ├── runtime/             # StateGraph execution DAG, checkpoints, HITL
│   ├── memory/              # 4-tier memory (episodic, fact, preference, task)
│   ├── rag/                 # Vector indexing, hybrid search, RAG ingestion
│   ├── semantic-cache/      # Cosine similarity caching & instant SSE hits
│   ├── model-router/        # Real-time empirical latency tracker & routing
│   ├── eval/                # Quality gating, completeness, error scoring
│   ├── prompts/             # Canonical specialist personas & composite prompts
│   ├── billing/             # Token metering, budget guards, cost ledger
│   ├── resilience/          # Circuit breakers, retries, timeouts, bulkheads
│   ├── events/              # Domain event publisher & event bus
│   ├── queue/               # Distributed BullMQ queues & priorities
│   ├── grpc/                # Protobuf RPC interfaces & typed clients
│   ├── observability/       # OpenTelemetry traces, metrics, JSON logging
│   └── sdk/                 # Client library for external integrations
├── docs/                    # Architecture, ADRs, learning notes, phase guides
├── .agents/                 # AI agent rules, continuity, and skill definitions
├── PROGRESS.md              # Live implementation tracker
└── IMPLEMENTATION-LOG.md    # Completed work history
```

---

## Tech Stack

- **Monorepo Engine**: [pnpm](https://pnpm.io/) workspaces + [Turborepo](https://turbo.build/)
- **Languages**: TypeScript (NodeNext strict), Python 3.11+
- **Agent Intelligence**: [LangGraph](https://langchain-ai.github.io/langgraph/), [LangChain](https://www.langchain.com/), `@orchestrai/runtime`
- **Browser Automation**: [Playwright](https://playwright.dev/) (headless Chromium)
- **Model Inference**: Enterprise cloud providers (OpenAI, Anthropic, Gemini, Groq) and private edge/cluster inference (Ollama, vLLM, DeepSeek) (100% database- and env-driven)
- **Database & Storage**: PostgreSQL 16+ via [Prisma](https://www.prisma.io/) + pgvector
- **Queueing & Realtime**: Redis 7+ with [BullMQ](https://bullmq.io/) + Server-Sent Events (SSE)
- **Validation & Contracts**: [Zod](https://zod.dev/) & [Pydantic v2](https://docs.pydantic.dev/)

---

## Getting Started

### Prerequisites

- Node.js >= 20 (v24 recommended)
- pnpm >= 9 (v12 recommended)
- Python >= 3.11
- PostgreSQL 16 with pgvector & Redis 7 (or Docker compose)
- LLM Inference provider configured (Cloud API keys or local Ollama/vLLM daemon)

### Quick Setup

```bash
# 1. Install TypeScript workspace dependencies
pnpm install

# 2. Run database migrations & generate Prisma client
pnpm db:migrate

# 3. Setup Python virtual environments for Intelligence & Crawler
pnpm py:setup

# 4. Start all development servers
pnpm dev
```

---

## Workspace Scripts

| Command                | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `pnpm dev`             | Starts all workspace development services concurrently    |
| `pnpm build`           | Builds all packages and applications via Turbo            |
| `pnpm typecheck`       | Runs TypeScript typechecks across all 46 monorepo targets |
| `pnpm lint`            | Runs ESLint across all files (`--max-warnings=0`)         |
| `pnpm format`          | Formats the codebase using Prettier                       |
| `pnpm db:migrate`      | Runs database migrations                                  |
| `pnpm db:studio`       | Opens Prisma Studio GUI                                   |
| `pnpm py:setup`        | Initializes Python venvs and installs requirements        |
| `pnpm py:intelligence` | Runs the LangGraph Intelligence service on port 8082      |
| `pnpm py:crawler`      | Runs the Playwright Crawler service on port 8083          |

---

## AI Agent Development Guidelines

All AI coding assistants (Antigravity, Claude, Copilot, Cursor) must adhere to:

- [`.agents/AGENTS.md`](.agents/AGENTS.md) — Master instructions and invariants
- [`.agents/rules/00-core-invariants.md`](.agents/rules/00-core-invariants.md) — 250-line maximum rule and JSDoc requirements
- [`.agents/rules/architecture.md`](.agents/rules/architecture.md) — Monorepo boundary rules
- [`PROGRESS.md`](PROGRESS.md) — Live implementation progress
