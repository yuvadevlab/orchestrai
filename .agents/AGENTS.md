# AGENTS.md — AI Agent Operating Instructions for OrchestrAI

Welcome, Agent. You are pair-programming on **OrchestrAI**, a local-first, modular AI agent orchestration platform.

## 1. Prime Directive

1. **Check Progress First**: Read [`PROGRESS.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/PROGRESS.md) and [`IMPLEMENTATION-LOG.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/IMPLEMENTATION-LOG.md) before writing ANY code or proposing solutions.
2. **One Phase at a Time**: Never skip ahead or implement multi-phase features concurrently without explicit direction.
3. **Strict Contracts**: `@orchestrai/core` is the absolute source of truth. All data structures, events, and interfaces MUST be backed by Zod schemas and TypeScript types.
4. **Local-First Reliability**: Default to zero external cloud dependencies for development (PostgreSQL + pgvector, Redis, Ollama). External APIs (Anthropic, OpenAI) are opt-in adapters.
5. **Continuous Session Continuity**: Leave the codebase in an unambiguous, continuation-ready state at the end of every session. Update `PROGRESS.md` and log completed work.

---

## 2. Workspace Navigation

```text
orchestrai/
├── apps/                    # Deployable runtimes
│   ├── gateway/             # REST/SSE/WS ingress API (Port 4000)
│   ├── worker/              # Background queue consumer (BullMQ)
│   ├── realtime/            # Streaming event broker (Port 4001)
│   └── console/             # Next.js operator dashboard (Port 3000)
├── packages/                # Modular internal libraries
│   ├── core/                # Shared contracts & types (Zero internal deps)
│   ├── models/              # LLM provider adapters
│   ├── tools/               # Tool execution & permission engine
│   ├── agent/               # Agent loop & state machine
│   ├── runtime/             # LangGraph stateful execution
│   ├── queue/               # BullMQ producers & definitions
│   ├── events/              # Event bus & outbox pattern
│   ├── memory/              # Short/long-term memory & summarization
│   ├── rag/                 # Embeddings & pgvector retrieval
│   ├── observability/       # Tracing, structured logs, metrics
│   └── sdk/                 # Client SDK for consumers
├── infrastructure/          # Docker compose, DB init, local models
├── docs/                    # Architecture, ADRs, learning notes, phase guides
├── .agents/                 # Rules, agent instructions, skill definitions
└── PROGRESS.md              # Live status tracking table
```

---

## 3. Engineering Rules & Invariants

- **Package Boundary Rule**: Dependencies flow inward: `apps` -> `packages` -> `core`. `packages/core` must NEVER import from another workspace package.
- **Strict TypeScript**: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, explicit return types on exported functions.
- **Fail-Safe & Idempotent**: Tools, event handlers, and queue jobs must be idempotent and handle transient failures gracefully.
- **No Floating Promises**: Always await or explicitly void unhandled asynchronous operations.
- **Logging Standards**: Use structured JSON logging with correlation IDs (`traceId`, `agentRunId`, `executionId`).

---

## 4. Session Handoff Protocol

When ending a session or completing a feature:

1. Verify build / tests: run typecheck and test scripts.
2. Update [`PROGRESS.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/PROGRESS.md) to mark completed items `[x]`, in-progress `[~]`, or remaining `[ ]`.
3. Append a detailed entry to [`IMPLEMENTATION-LOG.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/IMPLEMENTATION-LOG.md).
4. Clearly state the **Exact Next Step** for the next agent session.
