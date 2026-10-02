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

### Milestone 10: System-Wide Access, Multi-Root Sandboxing & Sensitive File Protection

- [x] **Sensitive Path & Threat Classifier (`classifyPathSensitivity`)**: Pattern detection for critical credentials (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gcloud`, `~/.kube`, `id_rsa`), secrets (`.env`, `.env.*`), and protected system paths (`/etc`, `/System`).
- [x] **Dynamic Multi-Root Path Sanitizer (`sanitizePath`)**: Upgraded path jail allowing multiple approved roots (`workspaceRoot` + session grants + permanent grants) and home directory tilde (`~`) expansion.
- [x] **Tool Execution Context Multi-Root Support**: Added `allowedRoots` to `ToolExecutionContext` across `read_file`, `write_file`, and `list_dir`.
- [x] **Interactive High-Risk Clearance UI (`StudioPermissionCard`)**: Semantic warning tokens and specialized confirmation banners when agents attempt to access sensitive credentials or keys.
- [x] **System-Wide Prompt Awareness (`AUTONOMOUS_TOOLS_SYSTEM_PROMPT`)**: Prompt instructions allowing the agent to explore external directories on the machine with interactive operator clearance.

### Phase 11 — The Distributed Real-Time Backbone & BullMQ Queue Dispatch

- [x] **Redis Pub/Sub Event Streaming**: Gateway publishes live LLM tokens, tool calls, and approval events to `orchestrai:realtime:execution:<id>`.
- [x] **Realtime SSE & WebSocket Broadcast**: `apps/realtime` subscribes to Redis Pub/Sub channels and fans out SSE streams directly to subscribers.
- [x] **BullMQ Background Execution Producer**: `apps/gateway` enqueues background/async execution workloads via `AgentExecutionProducer` to BullMQ.
- [x] **Worker Daemon Ready**: `apps/worker` runs `AgentExecutionWorker` polling Redis queues with `OrchestrAIRuntime` DAG execution.

### Phase 13 — Knowledge, Memory, Evaluations Hubs & ChatGPT-Style File Attachment

- [x] **ChatGPT-Style File Attachment (`+` Button)**: Floating bottom composer in Studio features a `+` button trigger, local file selection, automatic background ingestion into RAG vector storage (`POST /api/v1/rag/documents`), and interactive document chips with removal capability.
- [x] **RAG Knowledge Base Hub (`/knowledge`)**: Full document registry, multi-format upload modal, and live hybrid vector query tester showing similarity score percentages and chunk matches.
- [x] **Cross-Session Memory Hub (`/memory`)**: Memory management interface with fact creation dialog, semantic recall tester matching runtime agent prompt context, and priority scoring.
- [x] **Capability Evaluations Hub (`/evaluations`)**: Benchmark evaluation runner against model engines, interactive accuracy gauge, latency breakdowns, and dataset catalogue.
- [x] **OpenTelemetry Span Waterfall (`/executions/[executionId]`)**: Real-time visualization of execution sub-task spans, start offsets, durations, and attribute inspectors.
- [x] **API Hook Architecture Standard (`api/use-*.ts`)**: Decomposed all API mutations and queries into dedicated `use-*.ts` files under `features/<feature>/api/` (`use-upload-document.ts`, `use-ingest-document.ts`, `use-knowledge-documents.ts`, `use-delete-document.ts`, `use-query-knowledge.ts`, `use-memories.ts`, `use-create-memory.ts`, `use-delete-memory.ts`, `use-search-memories.ts`, `use-evaluation-datasets.ts`, `use-run-benchmark.ts`). Zero direct `client.http.request` routes in TSX presentation layers.
- [x] **Enum Normalization & Lowercase snake_case Invariant**: Shared enums (`DocumentUploadStatus`, `TraceSpanStatus`, `DocumentMimeType`, `BenchmarkDatasetName`, `MemoryType`, `PermissionScope`, `ApprovalRiskLevel`, `ArtifactType`, `ArtifactStatus`, `PlanStepStatus`, `EpisodeOutcome`) in `@orchestrai/shared-types`. Modularized `packages/shared-types/src/enums/` to keep all files < 250 lines. Zero raw string comparisons in UI or services.
- [x] **Valid RFC 4122 v4 UUID Format**: Eliminated synthetic/fake non-UUID strings (`"d1a10001-..."`, `"eval-msg"`). Implemented standard `randomUUID()` generation adhering to `EvaluationDatasetSchema` and `ChatMessageSchema`.
- [x] **Single-Toolbar UI Standard (Zero Nested Search Bars)**: Redesigned Knowledge and Memory hubs to strictly match the canonical `/agents` page pattern. Removed inline query/recall boxes with duplicate search bars; converted query/recall testing into accessible modal dialogs (`KnowledgeQueryDialog`, `MemoryRecallDialog`) accessible via header action buttons. Search bar uses native `Input startIcon={<Search className="size-3.5" />}` with zero broken padding or overlapping icons.
- [x] **Zero Fallback/Dummy Menus**: Completely eliminated hardcoded fallback menus (`DEFAULT_MODES`) in frontend; UI cleanly relies on live database states with accessible loading indicators.
- [x] **Real-Time Cross-Origin SSE Streaming & W3C Token Delimiter Compliance**:
  - Resolved browser CORS preflight (`OPTIONS /api/v1/stream`) failure caused by missing `X-Tenant-ID` and custom headers in `apps/realtime`.
  - Configured dynamic `localhost`/`127.0.0.1` origin reflection, `Access-Control-Allow-Credentials: true`, and socket TCP no-delay (`req.socket.setNoDelay(true)`).
  - Clean stream closure on `done`/`error` events with `res.end()` preventing indefinite socket hang.
  - Aligned `@orchestrai/sdk` `sse-parser.ts` with W3C SSE standard: only stripped single leading space delimiter (`rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue`) instead of aggressive `.trim()`, preserving inter-word whitespace and newlines for live streaming tokens.
  - Added immediate loop termination (`break;`) on `done` or `[DONE]` events in `use-agent-runner.ts`.
  - Extracted HITL operator approval resolution mutation into `apps/console/src/features/studio/api/use-resolve-approval.ts` per modular API hook architecture guidelines, keeping `use-agent-runner.ts` well under 250 lines (227 lines).
- [x] **Default-Collapsed Multi-Domain Tool Artifacts & Safe Process Termination**:
  - Converted all 4 Studio artifact cards (`ArtifactTerminalCard`, `ArtifactCodeCard`, `ArtifactDocumentCard`, `ArtifactSearchCard`) to default-collapsed state with interactive "Show" / "Hide" toggles, chevron indicators, and clean single-line summary headers.
  - Hardened bash tool execution against process hangs and unhandled timeout rejections by returning POSIX standard exit code 124 on timeout rather than unhandled promise rejection.
  - Guided autonomous system prompts to exclude heavy folders (`node_modules`, `.git`) when searching and search sibling folders for external repositories.
- [x] **Multi-Repository Trust Boundaries & Provenance-Guarded Anti-Hallucination**:
  - Injected dynamic active workspace identity (`orchestrai`) and detected sibling repositories in parent directory (`finai`, `devlab-shared`, etc.) into `buildInitialConversationHistory`.
  - Added smart sibling candidate resolution in `sanitizePath` and `checkPermission`: paths like `finai/package.json` resolve to `../finai/package.json` outside the workspace root, correctly triggering interactive HITL clearance cards.
  - Added explicit filesystem provenance headers to `read_file` tool output (`[File: ... (Workspace: "orchestrai", path: ...)]`) so the model never confuses files from the current repo with external projects.
  - Updated tool call prompt examples to specify `apps/gateway/src/index.ts` and `../finai/package.json` rather than bare `package.json`.

---

### Phase 14 — System-Wide AI Agent Data Model & Universal Access Architecture

- [x] **System-Level Agent Elevation**:
  - Decoupled `Agent` from repository, project, or application scopes. Made `Agent` a platform-level entity with `scope: PlatformScope @default(platform)` and nullable `tenantId`.
  - Clean architectural separation: Agent (orchestration) $\rightarrow$ Capabilities (domain boundary) $\rightarrow$ Tools (concrete operations) $\rightarrow$ Resources (target canonical URI).
- [x] **Generic Resource Registry & Canonical URI Taxonomy (`resources`)**:
  - Universal resource schema supporting canonical schemes: `file://`, `repo://`, `db://`, `api://`, `service://`, `tenant://`.
  - Implemented hierarchical containment checking (`isResourceContained(parentUri, childUri)`) enabling coarse-grained grants without repetitive clearance requests.
  - Created `ResourceRegistryService` in Gateway for URI normalization, target classification, and lazy database indexing.
- [x] **Capability-Based Permission Abstraction (`capabilities` & `capability_tools`)**:
  - Introduced `Capability` model grouping execution tools under intelligible functional permissions (Filesystem, Repositories, System Execution, Database, APIs, Memory).
  - Created `seedDefaultCapabilities` utility in `@orchestrai/database` providing idempotent platform capability seeding and tool bindings.
  - Added `CapabilityDefinitionSchema` and `AgentCapabilityBindingSchema` in `@orchestrai/core`.
- [x] **User Authority Chain & Persistent Access Grants (`access_grants` & `permission_requests`)**:
  - Enforced strict user-authority chain: agent cannot self-authorize.
  - Clearance requests persist to `permission_requests` with lifecycle states (`pending`, `approved`, `rejected`, `expired`, `revoked`).
  - Human approvals persist to `access_grants` with duration scopes (`once`, `session`, `permanent`) and permission tiers (`read`, `write`, `execute`, `admin`).
  - Created `DbGrantService` in Gateway for querying active grants, resolving approval promises, and revoking authorizations.
- [x] **Multi-Turn HITL Clearance Resolution & SSE Stream Heartbeat Resilience**:
  - **Component State Desynchronization Fix**: Added `key={message.approvalRequest.id}` to `StudioPermissionCard` in `studio-message-item.tsx` and reset resolution state on request changes, ensuring successive approval prompts (e.g. `package.json` followed by `pnpm-workspace.yaml`) mount interactive buttons rather than staying frozen in a resolved badge state.
  - **SDK Scope Pass-Through**: Updated `useResolveApproval.ts` and `approvals.ts` SDK resource to pass `scope` (`once`, `session`, `permanent`, `deny`) in the resolve payload, ensuring "Allow for this Chat" and "Always Allow" properly propagate to `sessionGrants` and `.orchestrai/permissions.json`.
  - **Session Grant Scope Resolution**: Passed `sessionId` (the conversation ID) from `live-execution.manager.ts` through `tool-approval-invoker.ts` into `createApprovalRequest` and `resolveApproval`, ensuring session-wide clearances match active conversation lookups across all turns.
  - **SSE Idle Timeout Prevention**: Embedded a 15-second heartbeat ping (`: ping\n\n`) into `attachExecutionSseStream` in `live-execution-broadcaster.ts` to prevent HTTP proxies and browsers from terminating open SSE connections during operator decision pauses.
  - **Read-File Prompt Confusion Elimination**: Removed ambiguous note from `read_file` header in `autonomous-agent-runner.ts` that erroneously caused LLMs to re-request already-read files.
  - **Sticky Live Activity Bar & Inline Approval Audit Log**:
    - Re-architected clearance UX by moving interactive security clearance prompts into sticky `StudioLiveActivityBar` anchored at the bottom between the message feed and command station, ensuring operators never need to scroll up to find approvals or monitor live tool/thinking execution.
    - Extracted `StudioLiveClearanceCard` sub-component and added `ApprovalDecisionChip` in `studio-message-item.tsx` to provide an inline, permanent audit log of the operator's decision (`Cleared (once)`, `Cleared (session)`, `Always Allow`, `Denied`) with timestamp and resource target.
    - Suppressed duplicate clearance cards in the message body during active streaming while keeping the audit log chip once resolved.
    - Decomposed `StudioWorkspace` into `useStudioWorkspaceState` hook and dedicated type definitions (`use-studio-workspace-state.types.ts`), maintaining strict < 250 LOC compliance and clean separation between UI layout and state/lifecycle management.
  - **Interleaved Chronological Message Segments Timeline (`MessageSegment`)**:
    - Upgraded `CoworkMessage` with `segments?: MessageSegment[]` supporting discrete parts (`thinking`, `plan`, `artifact`, `approval`, `text`) rendered in their exact chronological sequence instead of grouping all tool artifacts at the top of the message body.
    - Extracted `message-segment-utils.ts` and `execution-stream-consumer.ts` to maintain immutable chronological segment ordering during Gateway SSE streaming and clearance resolution.
    - Rendered `ApprovalDecisionChip` and collapsed tool cards directly in-line between the text blocks that preceded and followed them, matching native agent workflows in Claude Cowork and ChatGPT Canvas.

---

## 2. Invariant Compliance

- **Hard 250-Line Maximum Rule**: 100% of files across all `apps/` and `packages/` are strictly < 250 lines (zero exceptions; all new files < 200 lines).
- **Strict TypeScript & Zero Any**: `pnpm typecheck` passing with **0 errors** across all **37 targets**. Zero usage of `any` type.
- **ESLint**: `pnpm lint` passing with **0 warnings** (`--max-warnings=0`).
- **Design Tokens**: 100% semantic CSS theme tokens (`text-warning`, `border-border`, `bg-card`). Zero ad-hoc colors.
- **No Test Policy**: Zero test cases written during phase implementation until requested.

---

## 3. Next Architecture Transformation: Grand Unified Roadmap (Backend & Frontend)

Master architecture specification documented in [`master-architecture-plan.md`](file:///Users/yuvarajpattabi/.gemini/antigravity-ide/brain/8214e84f-c233-4f28-8c2d-354e1c57bf3f/master-architecture-plan.md).

### [x] Phase 0: Shared Domain Contracts & Ports (`@orchestrai/core`, `@orchestrai/shared-types`, `@orchestrai/sdk`)

- [x] Define repository interface ports in `@orchestrai/core`: `IExecutionRepository`, `ISessionRepository`, `IAgentRepository`, `IEventPublisher`, `IQueueProducer`
- [x] Normalize SSE event payload schemas and HITL clearance DTOs in `@orchestrai/shared-types` with zero hardcoded string literals (canonical `SseMessageRole`, `SseToolCallStatus`, `SseDoneStatus`, `ApprovalDecisionVerdict`, `PermissionScope`, `RequestStatus` enums)
- [x] Define CQRS command contracts in `@orchestrai/core`: `CreateExecutionCommand`, `CancelExecutionCommand`, `ResolveApprovalCommand`, `CreateSessionCommand`, `ICommandBus` with `ExecutionCommandType`, `ApprovalCommandType`, and `SessionCommandType` enums
- [x] Update `@orchestrai/sdk` client interfaces with typed `AdminResource` (control plane) and `RealtimeResource` (typed SSE streaming)

### [x] Phase 1: Gateway Hexagonal Decoupling, CQRS Refactor & Feature-Module Reorganization (`apps/gateway`)

- [x] Implement Prisma repository adapters in `apps/gateway` implementing `@orchestrai/core` ports (`PostgresExecutionRepository`, `PostgresSessionRepository`, `PostgresAgentRepository`, `RedisEventPublisherAdapter`, `BullMQQueueProducerAdapter`)
- [x] Extract dedicated domain entity mappers: `execution-entity.mapper.ts`, `session-entity.mapper.ts` — each < 100 lines, JSDoc-rich
- [x] Structure `apps/gateway` with CQRS command handlers (`CreateExecutionCommandHandler`, `CancelExecutionCommandHandler`, `ResolveApprovalCommandHandler`, `CreateSessionCommandHandler`)
- [x] Strip direct Prisma calls out of Gateway services; inject repository interfaces at bootstrap in `ExecutionService`
- [x] Full log-rich coverage on all repository adapters and services — every method entry, branch, error, and success path emits structured logs via `@yuva-devlab/logger`
- [x] **Feature-module reorganization**: Migrated 43 flat `services/`, 22 `routes/`, and 19 `controllers/` files into 13 feature modules under `src/modules/<domain>/` (auth, execution, session, agent, streaming, approval, permission, platform, memory, rag, eval, nav, trace, health)
- [x] All module `index.ts` barrel files created; backward-compatible re-exports in legacy `services/index.ts`, `controllers/index.ts`, `commands/index.ts`
- [x] Zero TypeScript errors (`pnpm typecheck` clean) after full reorganization

### [x] Phase 2: Extract Dedicated Execution Orchestrator (`apps/orchestrator`)

- [x] Scaffold `apps/orchestrator` as a standalone data-plane microservice with ESM + tsup build pipeline
- [x] Wire `OrchestrAIRuntime` DAG engine, state machine transitions, and Postgres checkpointer (`PoolDatabaseQueryRunner`)
- [x] Implement deterministic execution state machine (`ExecutionStateMachine`) with strict `Enum.KEY` guards (`OrchestratorState`, `OrchestratorEventType`)
- [x] Implement `GrpcExecutionService` implementing `@orchestrai/grpc` contracts; wire Gateway `ExecutionDispatcher` to delegate execution runs to Orchestrator via `GrpcClient`
- [x] Stream DAG step events, state changes, and token deltas to Redis Pub/Sub channels (`orchestrai:realtime:execution:<id>`) via `OrchestratorRedisPublisher`
- [x] Zero hardcoded strings: Added `OrchestratorState`, `OrchestratorEventType`, `OrchestratorPubSubEventName`, `PlatformScope`, `PlatformCapabilitySlug`, `PlatformToolName` in shared enums; updated agent rule files (`AGENTS.md`, `.agents/AGENTS.md`, `00-core-invariants.md`, `coding-standards.md`) to mandate strict `Enum.KEY` usage.

### [x] Phase 3: Extract Control Plane Service (`apps/admin`)

- [x] Scaffold `apps/admin` as a dedicated control-plane microservice (Port 4005)
- [x] Migrate all operator endpoints (`/platform/*`, providers, models, modes, roles, permissions, tools, tenants, budgets) to Admin
- [x] Implement separate operator JWT verification isolating admin traffic from user execution traffic
- [x] Store and load configurable HTTP header names via environment variables (`API_KEY_HEADER_NAME`, `ADMIN_API_KEY_HEADER_NAME`, `AUTH_HEADER_NAME`, `TENANT_HEADER_NAME`, `REQUEST_ID_HEADER_NAME`) across `.env` and `.env.example` with zero hardcoded header strings

### [x] Phase 4: Intelligence Packages & Realtime Streaming Pipeline

- [x] Build `packages/model-router`: dynamic provider routing, fallback cascades, latency P95/P99 tracking, and cost estimation
- [x] Build `packages/billing`: token counting, append-only cost ledger per tenant, usage aggregation, and budget enforcers
- [x] Build `packages/semantic-cache`: vector similarity search (>0.97 similarity) using `packages/rag` embeddings
- [x] Configure `apps/realtime` as a dedicated SSE/WebSocket broker subscribing to Redis channels and fanning out to clients
- [x] Configure `apps/worker` for heavy BullMQ async task processing (sandboxed Docker tools, batch evaluations)

### [x] Phase 5: Console 120 FPS Stream Engine & State Modernization (`apps/console`)

- [x] Implement `RafStreamBuffer` in `apps/console/src/lib/streaming/` with 16ms `requestAnimationFrame` coalescing
- [x] Implement incremental Markdown AST parser with frozen completed block cache to eliminate $O(N^2)$ re-parsing
- [x] Scaffold Zustand Tri-Tier store slices (`session-slice`, `canvas-slice`, `execution-slice`, `clearance-slice`)
- [x] Replace synchronous 5MB `localStorage` with asynchronous IndexedDB storage engine (`idb-keyval` / Dexie)

### [x] Phase 6: Dual-Pane Workspace Canvas & Virtualized Chat (`apps/console`)

- [x] Re-architect `StudioWorkspace` into responsive dual-pane layout (Left: Conversational Feed | Right: Interactive Canvas)
- [x] Build Interactive Canvas views (100% semantic CSS theme variables):
  - 💻 Code Editor with syntax highlighting, line numbers, folding, and one-click copy (`CanvasCodeView`)
  - 🌐 Sandboxed HTML/React Preview with isolated `iframe` (`sandbox="allow-scripts"`, `CanvasPreviewView`)
  - 🔄 Visual Diff Viewer with side-by-side theme highlights (`CanvasDiffView`)
  - ⚡ ANSI Terminal Emulator for CLI/Docker command output (`CanvasTerminalView`)
- [x] Virtualize message feed with `@tanstack/react-virtual` (`VirtualizedMessageFeed`)
- [x] Implement intent-aware scroll pinning (unpin on user scroll up + `New output streaming below ↓` pill)

### [x] Phase 7: Screen Consolidation & Operator Cockpits (`apps/console`)

- [x] Delete redundant duplicate `app/(dashboard)/console` route; redirect permanently to `/`
- [x] Upgrade `/executions` to interactive DAG Execution Visualizer (`DagVisualizer`) & Checkpoint Replayer (`CheckpointReplayer`)
- [x] Upgrade `/models` to Model Gateway & Cost/Latency Cockpit (`CostLatencyCockpit`)
- [x] Consolidate `/knowledge` and `/memory` into unified `/context` hub (`ContextHubPageContent`)
- [x] Elevate `/evaluations` in navigation for prompt rubric grading (`RubricGradingCard`) and benchmark suites
- [x] Implement global slide-out HITL Security Clearance Drawer (`ClearanceDrawer`) with blast-radius preview and keyboard shortcuts (`Cmd+Enter` approve, `Esc` deny)

### [x] Phase 8: Monorepo Hardening & Quality Gates

- [x] Verify 250-line rule across 100% of monorepo files (every file in apps/ and packages/ decomposed to <= 229 LOC)
- [x] Strict feature-first modular co-location: repositories moved into respective `session/`, `execution/`, and `agent/` modules; purged legacy `controllers/`, `services/`, and `repositories/`
- [x] Comprehensive JSDoc on every exported symbol; explanatory comments on every conditional/guard
- [x] Zero hardcoded domain strings/magic numbers; 100% semantic CSS theme tokens (`text-primary`, `text-destructive`, `bg-card`)
- [x] Zero hardcoded default values / fallback arrays: eliminated `DEFAULT_NAV_ITEMS` in `apps/console`, purged unused static nav files, removed database `seedIfEmpty` from `nav-item.service.ts` and `platform-mode.service.ts` (100% database-driven)
- [x] Monorepo typecheck validation (`pnpm typecheck`): 43/43 targets passing with 0 errors
- [x] Clean zero-warning commit quality gate validated with commitlint and lint-staged

---

### [ ] Intelligence Wiring — Activate Orphaned Packages

**Goal**: Every built package actively used. Zero dead code.

#### ✅ Completed — Package Activation (gateway)

- [x] **`@orchestrai/billing`** → `billing.service.ts` (new)
  - `TokenCounter.countMessageTokens()` → compaction trigger (75% context window)
  - `BudgetEnforcer.evaluateBudget()` → per-turn hard gate before each LLM call
  - `CostLedger.recordExpenditure()` → post-turn cost ledger write
  - All cost rates and context windows sourced from DB model record + env vars (zero hardcodes)

- [x] **`@orchestrai/events`** → `domain-event-publisher.ts` (new)
  - `EXECUTION_STARTED` emitted on first turn → Inspector Rail initialization
  - `TOOL_CALLED` / `TOOL_COMPLETED` around every tool dispatch → observability traces
  - `EXECUTION_COMPLETED` with token totals + duration → memory distillation trigger
  - `EXECUTION_FAILED` on error exit → failure episode record
  - `EXECUTION_CANCELLED` on stop signal → worker dequeue
  - `APPROVAL_REQUESTED` for HITL gate → realtime modal

- [x] **`@orchestrai/resilience`** → wired into `live-turn-executor.ts`
  - `createModelResiliencePipeline()` wraps every `OllamaAdapter.stream()` call
  - CircuitBreaker (5 failures → env-configured cooldown)
  - Retry (2 attempts, exponential backoff + full jitter)
  - Deadline (120s per turn)
  - Bulkhead (max 8 concurrent LLM calls)

- [x] **`@orchestrai/prompts`** → wired into `live-message-history.ts`
  - `AUTONOMOUS_TOOLS_SYSTEM_PROMPT` replaces inline system prompt string
  - `SPECIALIST_PERSONA_REGISTRY` resolves agent persona from DB agent role field
  - `buildCompositeSystemPrompt(personaRole, override)` is the single entry point

- [x] **Hardcoded constants eliminated**
  - `AGENT_MAX_TURNS` → env var (default 20)
  - `MODEL_DEFAULT_CONTEXT_WINDOW` → env var (default 8192)
  - `CONTEXT_COMPACTION_THRESHOLD` → env var (default 0.75)
  - Default model name `gemma4:31b-cloud` removed from agent creation fallback
  - `contextWindow` and `costPerTokenUsd` threaded from DB model record through dispatch chain

- [x] **`@orchestrai/semantic-cache`** → wired via `semantic-cache.service.ts` into live turn execution
  - Cosine vector similarity deduplication (threshold 0.97) with `ResilientEmbeddingProvider`
  - Zero-latency, zero-cost cache HIT returns cached response immediately via SSE
  - Auto-caches completed execution outputs on `ExecutionStatus.COMPLETED`

- [x] **`@orchestrai/rag`** → auto-inject top-3 knowledge chunks per execution prompt
  - Hybrid retrieval query (`ragService.query`) auto-appends relevant document context
  - Transparent fallback from Ollama embeddings to deterministic mock provider
  - Zero model call bloat when knowledge base is not populated

- [x] **`@orchestrai/model-router`** → `model-router.service.ts`
  - Real-time empirical per-model turn latency tracking via `LatencyTracker`
  - Dynamic routing strategies: `LOWEST_LATENCY`, `LEAST_EXPENSIVE`, `PRIORITY_FALLBACK`
  - Zero hardcoded fallback candidate constants; 100% database & environment driven

- [x] **`@orchestrai/eval`** → auto quality gate on `EXECUTION_COMPLETED` domain event
  - `initEvalQualityGate()` subscribes to `domainEventBus` on `DomainEventType.EXECUTION_COMPLETED`
  - Heuristic scoring of output completeness, tool usage, error indicators, and tokens/sec throughput
  - Non-blocking telemetry metrics emitted for operator cockpit

- [x] **Zero Hardcoded Default Agents & Synthetic Seeding Eliminated**
  - Purged `DEFAULT_SUPERVISOR` constant and `ensureTenantAgents` auto-seeding
  - Purged `Lead Orchestrator` fallback creation in `execution-dispatcher.ts`
  - If a tenant has no configured agent, system fails fast and explicitly informs user to create one
  - Eradicated all `gemma4:31b-cloud` default constants across the entire monorepo

#### [ ] Pending — Runtime + Agent Wiring

- [ ] **`@orchestrai/runtime`** → wire `StateGraph` into `apps/orchestrator` internals
- [x] **`@orchestrai/memory`** → full 4-tier recall at execution start, distill via event
  - 4-tier recall (`EPISODIC`, `FACT`, `USER_PREFERENCE`, `TASK`) in `memory.service.ts`
  - Automated event-driven memory distillation on `EXECUTION_COMPLETED` via `initMemoryDistillation()`
  - Zero hardcoded agent IDs or synthetic fallbacks

- [x] **`@orchestrai/agent`** → `AgentRunner` resolves from DB agent record
  - `resolveAgentRunner()` builds `AgentDefinition`, `AgentStateMachine`, and `AgentLoop`
  - Strict database-backed agent configuration with zero synthetic fallbacks or seeders

#### [ ] Pending — Runtime Wiring

#### [ ] Pending — New Services

- [ ] **`apps/intelligence`** (Python) → LangGraph agent loop replacing for-loop
- [ ] **`apps/crawler`** (Python) → Playwright browser automation + RAG ingestion
