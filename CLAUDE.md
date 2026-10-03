# OrchestrAI — Claude Code Developer Guide

You are working on **OrchestrAI**, a local-first, modular AI agent orchestration platform.
Master rulebooks are indexed in [`.agents/AGENTS.md`](.agents/AGENTS.md). Adhere strictly to all invariants.

---

## 1. Prime Invariants (Zero Exceptions)

1. **Hard 250-Line Maximum Rule**:
   - NO file across `apps/*` or `packages/*` may exceed **250 lines of code**.
   - Whenever a file approaches or reaches **200 lines**, decompose it immediately into focused sub-modules.
   - Every file must have a single, clear responsibility.
2. **Detailed JSDoc & Explanatory Comments**:
   - Every exported symbol (function, class, interface, type, schema) MUST have a comprehensive JSDoc block.
   - Every conditional (`if/else/switch`), guard clause, and state transition MUST have an inline comment explaining **why** it exists and what invariant or edge case it handles.
3. **Strict Package Boundaries**:
   - `@orchestrai/core` is the absolute source of truth with ZERO internal workspace dependencies.
   - All shared contracts, enums, schemas, and event types must originate from `@orchestrai/core`. Never duplicate.
4. **Conventional Commits & Quality Gates**:
   - Commits must pass `commitlint` (format: `<type>(<scope>): <subject>`). Scopes match apps and packages.
   - Pre-commit hooks run `lint-staged` with zero ESLint warnings (`--max-warnings=0`), Prettier, and Ruff.
   - Typechecks must pass cleanly: `pnpm typecheck`.
5. **Phase Implementation Testing Policy (Strict)**:
   - While implementing roadmap phases, **DO NOT** write or implement test cases (unit tests, e2e tests, integration tests) or Storybook stories unless explicitly instructed by the user.
6. **Zero Hardcoded Strings, Models & Strict Enum Usage**:
   - NO raw hardcoded string literals for domain entities, statuses, roles, event types, modes, scopes, or state transitions; always use shared `Enum.KEY`.
   - Zero hardcoded fallback model constants (`DEFAULT_FALLBACK_CANDIDATE`, `"gemma4:31b-cloud"`, `"qwen2.5:7b"`). Everything must be 100% database- or env-driven.
   - Zero synthetic fallback agents or auto-seeding (`DEFAULT_SUPERVISOR`, `Lead Orchestrator`). If a tenant has no agent, fail fast and instruct the user to create one in the Studio.
7. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex**:
   - NO client or worker application may hardcode operational parameters (slash commands, system prompts, max execution steps, sampling temperatures, compaction thresholds, cache similarity/TTL, RAG chunking parameters, retention policies, or starter suggestions).
   - All runtime behaviors must be dynamic, database- or control-plane-driven, served via Gateway APIs (`/api/v1/platform/...`), and cached with stale-while-revalidate IndexedDB persistence.
   - All regular expressions must originate from `@orchestrai/regex`. Zero inline regexes.

---

## 2. Essential Commands

```bash
# Typecheck entire monorepo (46 targets)
pnpm typecheck

# Code quality & linting (ESLint + Ruff)
pnpm lint
pnpm lint:fix

# Code formatting (Prettier + Ruff)
pnpm format
pnpm format:check

# Monorepo build
pnpm build

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:studio

# Python microservices setup
pnpm py:setup
```

---

## 3. Monorepo Map

- **Apps (`apps/*`)**: `console` (3001), `gateway` (4001), `realtime` (4002), `worker` (4003), `admin` (4004), `orchestrator` (gRPC 50051), `intelligence` (Python LangGraph 8082), `crawler` (Python Playwright 8083).
- **Packages (`packages/*`)**: `core`, `shared-types`, `database`, `models`, `tools`, `agent`, `runtime`, `memory`, `rag`, `semantic-cache`, `model-router`, `eval`, `prompts`, `billing`, `resilience`, `events`, `queue`, `grpc`, `observability`, `sdk`.
- **Roadmap & Progress**: Always consult [`PROGRESS.md`](PROGRESS.md) and [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md).
