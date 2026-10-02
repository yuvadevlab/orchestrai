# GitHub Copilot Instructions for OrchestrAI

You are working on **OrchestrAI**, a local-first, modular AI agent orchestration platform.
All code must strictly adhere to the project invariants documented below and in [`.agents/AGENTS.md`](../.agents/AGENTS.md).

---

## 1. Core Architectural Invariants

1. **Hard 250-Line Maximum Rule**:
   - NO file across `apps/*` or `packages/*` may exceed **250 lines of code**.
   - Whenever a file approaches **200 lines**, decompose it immediately into single-responsibility sub-modules.
2. **Detailed JSDoc & Explanatory Inline Comments**:
   - Every exported symbol (function, class, type, interface, schema) MUST have a comprehensive JSDoc block.
   - Every conditional (`if/else/switch`), guard clause, and state transition MUST have an inline comment explaining **why** it exists and what invariant it protects.
3. **Zero Hardcoded Strings & Strict Enum Usage**:
   - NO raw string literals for statuses, roles, event types, modes, or scopes; always use canonical `Enum.KEY` from `@orchestrai/shared-types`.
   - Zero hardcoded fallback models (`DEFAULT_FALLBACK_CANDIDATE`, `"gemma4:31b-cloud"`, `"qwen2.5:7b"`). All models must be DB- or env-driven.
   - Zero synthetic fallback agents or auto-seeding (`DEFAULT_SUPERVISOR`, `Lead Orchestrator`). Fail fast if unconfigured.
4. **Strict Monorepo Dependency Boundaries**:
   - `@orchestrai/core` is the absolute source of truth with ZERO internal workspace dependencies.
   - Dependencies flow inward: `apps/*` ──▶ `packages/*` ──▶ `@orchestrai/core`. Never create circular dependencies.
5. **Phase Testing Policy**:
   - Do NOT write or generate test cases (unit, e2e, integration) or Storybook stories unless explicitly instructed by the user.

---

## 2. Monorepo Architecture Directory

- **Apps (`apps/*`)**:
  - `console`: Next.js 15 Operator Studio & Agent Cockpit (`3001`).
  - `gateway`: API Ingress, Auth, Rate Limiting, Semantic Cache, Model Router (`4001`).
  - `realtime`: SSE & WebSocket Event Streaming Broker (`4002`).
  - `worker`: BullMQ Background Task Engine (`4003`).
  - `orchestrator`: Dedicated gRPC StateGraph Execution Engine (`50051`).
  - `admin`: Backoffice & Tenant Administration Portal (`4004`).
  - `intelligence`: Python LangGraph Reasoning & Conversational RAG (`8082`).
  - `crawler`: Python Playwright Web Scraping & RAG Ingestion (`8083`).

- **Domain Packages (`packages/*`)**:
  - `core`, `shared-types`, `database`, `models`, `tools`, `agent`, `runtime`, `memory`, `rag`, `semantic-cache`, `model-router`, `eval`, `prompts`, `billing`, `resilience`, `events`, `queue`, `grpc`, `observability`, `sdk`.

- **Quality Gates**:
  - `pnpm typecheck`: Must pass 46/46 targets cleanly.
  - `pnpm lint`: ESLint (`--max-warnings=0`) + Ruff.
  - `pnpm format`: Prettier + Ruff.
