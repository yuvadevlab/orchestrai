# OrchestrAI — Engineering Progress Tracker

Live progress tracking for the **OrchestrAI** Universal Autonomous AI Agent & Cowork Platform.

---

## 1. Architecture Milestones

### Milestone 1: Monorepo Foundation & Core Contracts

- [x] Turborepo + pnpm v12 monorepo setup (`apps/*`, `packages/*`)
- [x] `@orchestrai/core` — Zero-dependency source of truth for all domain types, enums, and schemas
- [x] `@orchestrai/shared-types` — Protocol enums (`AgentMode`, `ExecutionStatus`, `ModelProvider`)
- [x] Conventional Commits + Commitlint + Husky pre-commit quality gates

---

### Milestone 2: Enterprise Database & Persistence (`@orchestrai/database`)

- [x] Native PostgreSQL 16 + Prisma 7 ORM pipeline (Zero-Docker required)
- [x] Declarative schema (`schema.prisma`) with 15 production models (Tenants, Users, Agents, Executions, Conversations, Messages, Memory, Outbox)
- [x] Automated migrations applied to `orchestrai_dev` (`pnpm db:migrate`)
- [x] `pg.Pool` connection adapter with `@prisma/adapter-pg`
- [x] Round-trip latency and pool health probe (`checkDatabaseHealth`)
- [x] Row-level multi-tenant query isolation (`executeTenantQuery`)
- [x] Zero-Docker embedded JSON fallback (`.data/orchestrai-local-store.json`)

---

### Milestone 3: Universal Autonomous Cowork Studio (`apps/console`)

- [x] **Threaded Session Engine**: Enterprise PostgreSQL synchronization via Gateway API (`/api/v1/conversations`), optimistic local-storage fallback, URL route sync (`/session/:sessionId`), and auto-naming
- [x] **Session History Drawer**: In-flow collapsible sidebar with live search, three-dots action menu (`...`), and thread deletion
- [x] **Studio Workspace Coordinator**: Full multi-agent canvas with real-time SSE stream ingestion
- [x] **Universal Starter Cards**: 4 multi-domain starters (Research, Writing, Engineering, Analytics)
- [x] **Reasoning Drawer**: Collapsible chain-of-thought thinking block with live duration timers
- [x] **Interactive Plan Checklist**: Real-time progress tracker (`[x]`, `[~]`, `[ ]`)
- [x] **Multi-Domain Artifact Cards**:
  - 📄 Document / PRD viewer with copy & `.md` download
  - 💻 Code & Diff card with syntax highlighting
  - ⚡ Dark Terminal window with stdout logs and exit codes
  - 🔍 Web search & citation card
- [x] **Command Prompt Station**: Auto-expanding input with specialist tags, keyboard shortcuts (`⌘ + Enter`), and suggestion pills
- [x] **Live Inspector Rail**: Real-time telemetry audit events and system health
- [x] **Light & Dark Theme Engine**: Full system/manual theme toggle integrated into 56px Nav Rail
- [x] **TanStack Query Enterprise Caching**: `AppQueryProvider` with scoped cache keys (`['agents']`, `['tools']`, `['models']`, `['executions']`), background cache deduping, mutations with automatic cache invalidation (`useCreateAgentMutation`, `useRegisterModelMutation`, `useRegisterToolMutation`, `useLoginMutation`, `useSignupMutation`, `useForgotPasswordMutation`), and cross-tab cache clearing on logout
- [x] **5 Core Product Hubs**: Studio (`/`), Specialists (`/agents`), Tools (`/tools`), Executions (`/executions`), Models (`/models`)

---

### Milestone 4: Ingress Gateway & Authentication (`apps/gateway`)

- [x] Fastify HTTP REST, SSE, and WebSocket endpoints (Port `4001`)
- [x] HMAC-signed bearer token issuance & validation (`TokenService`)
- [x] `scrypt` cryptographic password hashing with unique per-user salts
- [x] Prisma-backed user signup, login, and password reset (`AuthService`, `PasswordResetService`)
- [x] Rate limiting, CORS origin configuration, and request ID tracing middleware
- [x] Asynchronous execution dispatch and cancellation (`ExecutionService`)

---

### Milestone 5: Streaming Realtime Broker (`apps/realtime`)

- [x] High-concurrency WebSocket & SSE server (Port `4002`)
- [x] Distributed Redis Pub/Sub adapter with automatic in-process memory event bus fallback
- [x] Heartbeat liveness ping/pong, tenant topic channels, and connection draining

---

### Milestone 6: Background Task Worker (`apps/worker`)

- [x] Distributed BullMQ job processing engine (Port `4003`)
- [x] Agent execution worker (`AgentExecutionWorker`), tool executor (`ToolExecutionWorker`), and dead-letter queue (`DeadLetterWorker`)
- [x] Concurrency limits, retry backoff, and graceful signal handling

---

### Milestone 7: Domain Engines & Tooling Packages

- [x] `@orchestrai/models` — Unified adapter registry for Ollama (local), Groq, OpenRouter, Google AI Studio, OpenAI, Anthropic
- [x] `@orchestrai/tools` — Sandboxed tool execution registry with permission levels (`READ_ONLY`, `WRITE_SAFE`, `SENSITIVE`, `DANGEROUS`)
- [x] `@orchestrai/agent` — Autonomous agent execution loop, state machines, and reflection
- [x] `@orchestrai/runtime` — Multi-step DAG orchestration with checkpoint recovery
- [x] `@orchestrai/queue` — BullMQ job producers with priority scheduling
- [x] `@orchestrai/events` — Distributed event bus, outbox pattern, and idempotency store
- [x] `@orchestrai/memory` — Multi-tiered short-term, episodic, and semantic memory stores
- [x] `@orchestrai/rag` — Document chunking, vector indexing, and embedding retrieval
- [x] `@orchestrai/observability` — OpenTelemetry distributed tracing and structured JSON logging
- [x] `@orchestrai/sdk` — TypeScript client library for Gateway integrations

---

### Milestone 8: Autonomous Multi-Turn Execution & HITL Multi-Workspace Security

- [x] `@orchestrai/prompts` — Centralized persona prompts, autonomous tool prompt specifications, and template builders
- [x] Multi-Workspace Trust Engine (`PermissionPolicyManager`) with `.orchestrai/permissions.json` file-backed persistence
- [x] Continuous Multi-Turn Context Memory — Dynamic message history passing across turns ensuring LLM context retention
- [x] PostgreSQL Thread & Message Persistence — Synchronizing user prompts and assistant outputs into Prisma `conversations` and `messages` tables
- [x] Bash Clearance & Child Process Sandbox — Proper working directory anchoring and permission resolution
- [x] Interactive 4-Action Clearance Card (`StudioPermissionCard`) with inline status collapse

---

### Milestone 9: Zero Hardcoded Dynamic Database Architecture

- [x] **Zero Hardcoded Specialists**: Purged all static personas and fallbacks (`specialists-data.ts` removed). Studio queries agents live from PostgreSQL via `useAgents()`.
- [x] **Zero Hardcoded Models & Providers**: Catalog loaded live from `llm_models` and `llm_providers` database tables via `useModels()` and `useProviders()`.
- [x] **Zero Hardcoded Autonomy Modes**: Segmented toggles and execution modes fetched live from `platform_modes` table via `usePlatformModes()`.
- [x] **Zero Hardcoded Roles & Permissions**: Form dialogs, badges, and filters dynamically driven by `platform_roles` and `platform_permissions` tables via `useAgentRoles()` and `usePermissions()`.
- [x] **Zero Hardcoded Tools**: Tool catalog and security sandboxes queried live from `platform_tools` table via `useTools()`.
- [x] **Lowercase snake_case Normalization**: All database slugs, tiers, and permissions normalized to lowercase format (`read_only`, `write_safe`, `strategy`, `research`, etc.).
- [x] **Full Enum Normalization (All Types)**: Every Prisma enum (`ExecutionStatus`, `MessageRole`, `ApprovalStatus`, `ToolPermissionLevel`, `OutboxStatus`, `PlatformScope`) migrated to lowercase in the DB via `ALTER TYPE RENAME VALUE`. Schema.prisma, Prisma client, shared-types, and all gateway services aligned. 32/32 typecheck targets passing.

---

## 2. Invariant Compliance

- **Hard 250-Line Maximum Rule**: 100% of files across all `apps/` and `packages/` are strictly < 250 lines (zero exceptions).
- **Strict TypeScript**: `pnpm typecheck` passing with **0 errors** across all **32 targets**.
- **ESLint**: `pnpm lint` passing with **0 warnings**.
- **No Test Policy**: Zero test cases written during phase implementation until requested.
