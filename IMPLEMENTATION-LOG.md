# OrchestrAI — Implementation Log

Chronological log of architecture, engineering decisions, and completed milestones for OrchestrAI.

## Session: 2026-10-03 (Continued) — Harness Audit, Bug Fixes & HITL Semi-Autonomous Engineering

### Summary of Completed Work

#### 1. Parser & Invariant Bug Fixes

- **ESLint Compact Formatter Diagnostic Parsing**:
  - Added `ESLINT_COMPACT_DIAGNOSTIC_REGEX` to `@orchestrai/regex` matching compact format (`/path: line X, col Y, Error - msg (rule)`).
  - Updated `WorkspaceDiagnosticRunner` to parse compact ESLint lines and fall back to stylish format without missing errors.
  - Added project-aware `tsc` execution reading `tsconfig.json` to eliminate false-positive path-alias and JSX errors on single-file checks.
- **Strict Enum Invariant Enforcement (Rule 7)**:
  - Replaced raw string literals (`=== "bash"`) with canonical `WorkspaceTool.BASH` across `tool-approval-invoker.ts`, `permission-policy.manager.ts`, `permission-evaluator.ts`, and `resource-registry.service.ts`.
- **Centralized Regex Invariant Enforcement (Rule 8)**:
  - Added `LANGUAGE_CLASS_REGEX` and `STRIP_TOOL_CALLS_REGEX` to `@orchestrai/regex`.
  - Replaced inline regexes in `apps/console/src/components/markdown-renderer.tsx`.

#### 2. Dynamic Workspace Path Isolation & Propagation

- **Console Studio Forwarding**:
  - Updated `useAgentRunner` in `apps/console` to forward `workspacePath: activeWorkspace?.path` to `client.agents.run(...)`.
  - Hooked `activeWorkspace` from `useConsoleStore` in `useStudioWorkspaceState`.
- **Gateway Runtime Execution Target**:
  - Updated `ExecutionDispatcher.dispatch` and `LiveExecutionManager.startExecution` to accept `workspacePath`.
  - Dynamically points `workspaceInstructionLoader.loadContext(workspacePath || resolveMonorepoRoot())` to the operator's active project directory rather than hardcoding the monorepo root.
  - Linked `harnessSkillRegistry.getWorkspaceRoot()` as default target for tool approval and sandboxed execution.

#### 3. Semi-Autonomous HITL Clearance for Code Modifications

- **`WorkspaceTool.WRITE_FILE` Clearance Gate**:
  - Enhanced `permission-evaluator.ts` to require operator clearance for file write operations unless authorized in `onceGrants`, `sessionSet`, or `permanentGrants`.
  - Prompts human operator with `StudioLiveClearanceCard` (`Allow Once | This Chat | Always Allow | Deny`) before modifying code.
  - Once granted for "This Chat", subsequent writes and self-repair diffs in the session proceed autonomously.

#### 4. Workspace Harness API & Studio UI Integration

- **Harness Context Endpoint**:
  - Added `GET /api/v1/workspace/harness` to `WorkspaceController` returning loaded instructions, rules count, and skills count.
- **Console UI Status Pill**:
  - Implemented `useWorkspaceHarness` hook in `apps/console/src/features/studio/api/use-workspace-harness.ts`.
  - Added live harness status pill in `StudioHeader` (`e.g. "X rules · Y skills"`), providing immediate visual transparency of loaded workspace context.
- **Enhanced Tool Artifacts**:
  - Formatted specialized visual cards in `autonomous-agent-runner.ts` for `VERIFY_CODE`, `READ_SKILL`, and `LIST_SKILLS`.

#### 5. Strict Invariants Verified

- Verified 48/48 packages pass `pnpm typecheck`.
- Verified `pnpm lint` (`--max-warnings=0`) with zero errors.
- Verified all 8 modified files are strictly below the 250 LOC threshold (`studio-header.tsx`: 100 LOC, `live-execution.manager.ts`: 248 LOC, `use-agent-runner.ts`: 229 LOC).

---

## Session: 2026-10-03 (Continued) — Milestone 14: Big 3 Agent Harness Engineering

### Summary of Completed Work

#### 1. Centralized Harness Lexical & Diagnostic Regexes (`@orchestrai/regex`)

- Added [`harness.regex.ts`](packages/regex/src/harness.regex.ts):
  - `YAML_FRONTMATTER_REGEX`: Extracts markdown YAML frontmatter blocks delimited by `---`.
  - `YAML_KEY_VALUE_REGEX`: Parses YAML key-value pairs without heavy external dependencies.
  - `TSC_DIAGNOSTIC_REGEX`: Parses TypeScript compiler output (`file(line,col): error TS...`).
  - `ESLINT_DIAGNOSTIC_REGEX`: Parses ESLint compact output (`line:col error message rule`).
  - `RUFF_DIAGNOSTIC_REGEX`: Parses Python Ruff linter output (`file:line:col: rule message`).
  - `TOOL_CALL_BLOCK_REGEX`: Reusable fenced tool-calling block matcher.

#### 2. Universal Harness Type Contracts (`@orchestrai/shared-types`)

- Added [`harness.ts`](packages/shared-types/src/harness.ts):
  - `DiagnosticSeverity` (`ERROR`, `WARNING`, `INFO`).
  - `DiagnosticToolType` (`TSC`, `ESLINT`, `RUFF`, `PRETTIER`, `SYNTAX`, `WORKSPACE_RULE`).
  - `WorkspaceInstructionType` (`AGENTS_MD`, `RULE`, `SKILL`, `COPILOT`, `CLAUDE`, `CURSOR`).
  - `HarnessDiagnosticItem` & `HarnessDiagnosticReport` interfaces.
  - `WorkspaceSkillMetadata`, `WorkspaceRuleMetadata`, and `WorkspaceHarnessContext`.
- Expanded `WorkspaceTool` enum with `VERIFY_CODE`, `READ_SKILL`, and `LIST_SKILLS`.

#### 3. Gateway Harness Subsystem (`apps/gateway/src/modules/harness/`)

- Implemented modular harness services (< 250 LOC each):
  - **`workspace-instruction-loader.ts`**: Automatically scans for root instructions (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`), modular rulebooks (`.agents/rules/*.md`, `.cursor/rules/*.md`), and on-demand skills (`.agents/skills/**/SKILL.md`, `skills/**/SKILL.md`). Ingests YAML frontmatter and formats structured prompt context blocks.
  - **`workspace-diagnostic-runner.ts`**: Language-aware diagnostic execution running `eslint` and `tsc` for TypeScript/JavaScript and `ruff` for Python. Enforces the Hard 250-Line Maximum Rule invariant directly on modified files.
  - **`code-standards-gate.ts`**: Post-write evaluation gate. Enriches tool outputs with structured error summaries and instructs the model to analyze, formulate a diff, and request HITL clearance before applying fixes.
  - **`harness-skill-registry.ts`**: In-memory cache for dynamic skill and rule retrieval.

#### 4. Sandbox Tool Integration (`apps/gateway/src/modules/streaming/`)

- **`workspace-tool-executor.ts`**:
  - Hooked `codeStandardsGate.evaluateWrittenFile` directly into `WorkspaceTool.WRITE_FILE`. If diagnostics fail, returns structured violations and marks `isError: true` to prevent unvalidated completions.
  - Added `WorkspaceTool.VERIFY_CODE` for explicit on-demand diagnostic checks.
  - Added `WorkspaceTool.READ_SKILL` to let agents read full skill instructions.
  - Added `WorkspaceTool.LIST_SKILLS` to let agents inspect available capabilities.
- **`live-execution.manager.ts`**:
  - Integrated dynamic workspace discovery at execution bootstrap (`workspaceInstructionLoader.loadContext()`).
  - Injects discovered rules and available skills directly into `augmentedSystemPrompt`.

---

## Session: 2026-10-03 (Continued) — Console Lib Folder Modularization & Architectural Cleanup

### Summary of Completed Work

#### 1. Directory Modularization (`apps/console/src/lib/`)

- Collapsed noisy root-level files into focused, domain-driven subdirectories:
  - `lib/auth/`: Centralized `client.ts`, `context.tsx`, and `index.ts`. All consumers import via `@/lib/auth`.
  - `lib/hooks/`: Aggregated platform hooks (`use-api-data.ts`, `use-modes.ts`, `use-nav.ts`, `use-platform-branding.ts`, and `index.ts`). All consumers import via `@/lib/hooks`.
  - `lib/navigation/`: Isolated `nav-icon-mapper.ts` and `index.ts`. Consumers import via `@/lib/navigation`.
  - `lib/providers/`: Extracted `query-provider.tsx` and `index.ts`. Consumers import via `@/lib/providers`.
- Retained only 4 universal root modules in `apps/console/src/lib`: `api-client.ts`, `error-utils.ts`, `types.ts`, and `utils.ts`.

#### 2. Dead Code & Duplicate File Purge

- Removed dead `theme.tsx` (superseded by `@yuva-devlab/ui`'s `ConfigProvider`).
- Removed duplicate `lib/use-platform-branding.ts` in favor of `lib/hooks/use-platform-branding.ts`.
- Removed deleted loose files (`auth-client.ts`, `auth-context.tsx`, `auth.ts`, `use-api-data.ts`, `use-modes.ts`, `use-nav.ts`).

#### 3. Verification & Quality Gates

- `pnpm typecheck` (48/48 packages) passed with zero errors.
- `pnpm lint` passed with zero ESLint warnings (`--max-warnings=0`) and clean Ruff checks.

---

## Session: 2026-10-03 — Milestone 13 Complete: End-to-End Hardcoded Value Eradication & Server-Driven Dynamic Configuration

### Summary of Completed Work

#### 1. Universal Domain Enums (`packages/shared-types`)

- **Namespaces & Keys**: Defined `ConfigNamespace.BRANDING`, `ConfigNamespace.TOOLS` and keys `WELCOME_HEADLINE`, `WELCOME_SUBTITLE`, `BRAND_NAME`, `BRAND_VERSION`, `CATEGORY_BLURBS`.
- **Role & Tool Classifications**: Created canonical `AgentRoleSlug` (`STRATEGY`, `RESEARCH`, `WRITING`, `ENGINEERING`, `DATA`, `AUTOMATION`, `SPECIALIST`), `PlatformToolName` (all 26 platform tools), and `ToolSandboxType` (`READ_ONLY`, `NETWORK_READ`, `NETWORK_WRITE`, `WORKSPACE_WRITE`, `EPHEMERAL_VM`).
- Rebuilt `@orchestrai/shared-types` cleanly.

#### 2. Modular Database Seeders (< 250 LOC with Zero Data Loss Guarantee) (`packages/database/src/seeds/`)

- Decomposed monolithic seeders into single-responsibility modules:
  - `seed-permissions.ts` (59 LOC): Seeds permissions with `ToolPermissionLevel`.
  - `seed-roles.ts` (83 LOC): Seeds roles with `AgentRoleSlug`.
  - `seed-tools.ts` (148 LOC): Seeds tools with `PlatformToolName`, `ToolSandboxType`, and `ToolPermissionLevel`.
  - `seed-agents.ts` (166 LOC): Uses `AgentMode`, `PlatformScope`, `AgentRoleSlug`, `PlatformToolName`, and env-driven `DEFAULT_SEED_MODEL`.
  - `seed-platform-configs.ts` (223 LOC): Seeds all namespaces using `ConfigNamespace` and `ConfigKey`.
  - `seed-capabilities.ts` (133 LOC): Uses `PlatformCapabilitySlug` and `PlatformToolName`.
  - `seed-providers-models.ts` (93 LOC): Uses `PlatformScope.PLATFORM` and env-driven model identifier.
- All seeders use idempotent `upsert` with `update: {}` to strictly protect pre-existing database records.

#### 3. Control Plane Gateway Services & Endpoints (`apps/gateway`)

- **Endpoints**:
  - `GET /api/v1/welcome`: Dynamic welcome headline, subtitle, and starter chips.
  - `GET /api/v1/branding`: Dynamic brand name and version badge.
  - `GET /api/v1/tools/categories`: Dynamic tool category descriptive blurbs.
  - `GET /api/v1/config/:namespace/:key` & `PUT /api/v1/config/:namespace/:key`: Scoped configuration reads/writes with admin guards.
- **Dynamic Services**:
  - `PlatformConfigService`: Unified cached accessor for branding, welcome, categories, cache, compaction, and execution.
  - `CognitivePolicyService`: Dynamic thinking tokens, temperature, and thinking guidelines.
  - `FeatureFlagService`: High-performance kill switches (e.g. `WorkspaceTool.BASH` kill switch check in `WorkspaceToolExecutor`).
  - `LiveTurnCompaction` & `LiveTurnExecutor`: Dynamic threshold ratio from database; dynamic temperature; eradicated static `lead-orchestrator` fallback.
  - `MemoryDistillation`: Removed static agent strings; safely resolves agent ID from event payload.

#### 4. Dynamic Console UI & Browser Persistence (`apps/console`)

- **Hooks & Components**:
  - `usePlatformWelcome` & `StudioWelcome`: Dynamic greeting headline, subtitle, and starter suggestions from database.
  - `usePlatformBranding`, `SidebarNav`, & `PageShell`: Dynamic application name and version badge; dynamic root breadcrumb.
  - `useToolCategories` & `ToolsPageContent`: Purged static `CATEGORY_BLURBS` constant; queries database-driven category blurbs.
  - `StudioWorkspaceSelector`: Removed hardcoded `orchestrai` fallback; dynamically reflects active workspace name or placeholder.
  - `workspace-slice.ts`: Dynamically resolves initial workspace directory from `process.env.WORKSPACE_ROOT` without static paths.
  - `stores/index.ts`: Dynamically configurable IndexedDB persistence store name (`process.env.NEXT_PUBLIC_STORE_NAME`).

#### 5. Worker & Crawler Dynamic Configuration (`apps/worker`, `apps/crawler`)

- `apps/worker/src/bootstrap/config.ts`: Purged static `ollama` provider fallback; strictly uses `process.env.DEFAULT_MODEL_PROVIDER`.
- `apps/crawler/src/config.py`: Made `rag_ingest_path` env-driven via `RAG_INGEST_PATH`.

---

## Session: 2026-10-02 (Continued) — Milestone 12 Complete: Anthropic-Grade Dynamic Cognition, Thinking & Database Seeding

### Summary of Completed Work

#### 1. Dynamic Cognition & Manifest Schema Models (`packages/database/prisma/schema.prisma`)

- Defined 4 foundational dynamic entities:
  - **`CognitivePolicy`**: Dynamic thinking tokens, temperature overrides, loop steps, and thinking guidelines.
  - **`SystemPromptTemplate`**: Versioned, living prompt templates and behavioral guidelines.
  - **`PlatformConfig`**: Unified namespaced JSON configuration store for slash commands, suggestion chips, cache parameters, compaction thresholds, and RAG chunking.
  - **`FeatureFlag`**: Instant sub-2ms kill switches and circuit breakers for tools and capabilities.
- Generated Prisma Client types with zero manual migrations.

#### 2. Idempotent Platform Database Seeders (`packages/database/src/seeds/`)

- Implemented modular seeders with a zero data loss guarantee (uses `upsert` with `update: {}` to strictly preserve existing database data without truncating or cleaning):
  - `seed-providers-models.ts`: Ollama provider and Gemma 4 31B model records.
  - `seed-modes-nav.ts`: Chat, Plan, Act, and Auto execution modes + 8 navigation hub items.
  - `seed-roles-tools.ts`: 4 platform permissions, 7 platform roles, and 11 execution tools.
  - `seed-agents.ts`: Default workspace tenant and 6 core specialist agents.
  - `seed-platform-data.ts`: Cognitive policy blueprints, prompt templates, and platform configs.
  - `seed-platform-manifest.ts`: Automated sync for cognitive policies, prompts, configs, and flags.
  - `seed-all.ts`: Master orchestrator running all seed modules in dependency order.

#### 3. Database-Driven Gateway Service (`apps/gateway`)

- Refactored `PlatformCommandService` to query `this.db.platformConfig` under `namespace: "commands"`, eliminating all hardcoded static fallback arrays.
- Integrated `seedAllPlatformData` into gateway bootstrap in `apps/gateway/src/index.ts`.

---

## Session: 2026-10-02 — Milestone 11 Complete: Platform Slash Commands API & Dynamic Consumer

### Summary of Completed Work

#### 1. Core Contracts (`packages/shared-types`)

- Defined `PlatformCommandRecord` entity interface in `packages/shared-types/src/platform.ts`.
- Rebuilt `@orchestrai/shared-types` package.

#### 2. Gateway Platform Slash Commands Module (`apps/gateway/src/modules/platform/`)

- **`PlatformCommandService` (`services/platform-command.service.ts`)**:
  - Service managing slash commands (`/plan`, `/act`, `/chat`, `/auto`, `/clear`, `/compact`, `/files`, `/help`).
  - Supports `listCommands(includeDisabled)`, `getCommand(commandId)`, `createCommand(dto)`, `updateCommand(commandId, patch)`, and `deleteCommand(commandId)`.
- **`PlatformCommandController` (`controllers/platform-command.controller.ts`)**:
  - Exposes REST handlers for listing, creating, updating, and deleting commands.
- **`registerPlatformCommandRoutes` (`controllers/platform-command.route.ts`)**:
  - Maps `GET /commands` (public read) and `POST /commands`, `PUT /commands/:id`, `DELETE /commands/:id` (admin protected).
  - Integrated into Gateway bootstrap in `apps/gateway/src/index.ts`.

#### 3. Console Dynamic Slash Commands Consumer (`apps/console`)

- **`usePlatformCommands` (`features/studio/api/use-platform-commands.ts`)**:
  - TanStack Query hook querying `/api/v1/commands`.
- **Dynamic Icon Resolution & Zero Hardcoding (`studio-slash-commands.types.ts`)**:
  - Removed static fallback array completely from client code.
  - Implemented `resolveCommandIcon` mapping icon strings to Lucide components.
  - Implemented `mapPlatformRecordToSlashCommand`.
- **`StudioSlashCommands` (`studio-slash-commands.tsx`)**:
  - Consumes dynamic commands from Gateway API.

---

## Session: 2026-09-29 (Continued) — Phase 6 Complete: Dual-Pane Workspace Canvas & Virtualized Chat

### Phase 6 Completion Summary

#### Dual-Pane Workspace Canvas Architecture (`apps/console/src/features/studio/components/canvas/`)

- **Interactive Multi-View Canvas Pane (`CanvasPane`)**:
  - Implemented responsive dual-pane split in `StudioWorkspace` (Left: Conversational Feed | Right: Interactive Canvas).
  - Mode switcher supporting 4 interactive views:
    - 💻 **`CanvasCodeView`**: Full syntax styling, line numbers, editable/read-only toggling, one-click clipboard copying.
    - 🌐 **`CanvasPreviewView`**: Isolated sandboxed HTML/React rendering (`<iframe sandbox="allow-scripts">`), external window pop-out, and hot reload.
    - 🔄 **`CanvasDiffView`**: Visual side-by-side diff comparing original vs modified artifact code with semantic theme highlights.
    - ⚡ **`CanvasTerminalView`**: Real-time ANSI terminal emulator for CLI and Docker commands with auto-scroll and clear actions.
- **Strict Semantic CSS Tokens**:
  - 100% adherence to theme variables (`text-primary`, `text-destructive`, `bg-card`, `bg-muted/40`, `text-foreground`, `text-muted-foreground`, `border-border/40`). Zero ad-hoc colors or raw text-rose/emerald classes.

#### Virtualized Message Feed with Intent-Aware Scroll Pinning (`VirtualizedMessageFeed`)

- **`@tanstack/react-virtual` Integration**:
  - Virtualizes long message streams to eliminate DOM node bloat during extensive autonomous turns.
- **Intent-Aware Scroll Pinning**:
  - Automatically pins scroll viewport to bottom during high-throughput token streaming.
  - Detects explicit user scroll-up (> 100px from bottom) to unpin auto-scroll, allowing uninterrupted reading of earlier message history.
  - Renders floating interactive pill (`New output streaming below ↓`) when new content arrives while unpinned; clicking smoothly scrolls to bottom and re-pins.

#### Quality Invariants & Validation

- **Hard 250-Line Rule**: 100% of files in `canvas/` and `VirtualizedMessageFeed` are strictly < 150 lines (highest LOC is 144).
- **TypeScript**: `pnpm --filter @orchestrai/console typecheck` passed with 0 errors.

---

## Session: 2026-09-29 (Continued) — Phase 5 Complete: Console 120 FPS Stream Engine & State Modernization

### Phase 5 Completion Summary

#### High-Performance 120 FPS Stream Engine (`apps/console/src/lib/streaming/`)

- **`RafStreamBuffer`**:
  - Implemented 16ms `requestAnimationFrame` coalescing stream buffer.
  - Batches fast inbound SSE text token deltas, scheduling React updates synchronized with display refresh rate (60Hz / 120Hz).
  - Eliminates main-thread state thrashing during high-throughput local and cloud inference.
- **`IncrementalAstParser`**:
  - Incremental Markdown AST segmentation engine separating frozen completed blocks (`code`, `paragraph`) from the active streaming tail text.
  - Eliminates $O(N^2)$ markdown re-parsing overhead by memoizing immutable AST blocks.

#### Asynchronous IndexedDB Offline Engine (`apps/console/src/lib/storage/`)

- **`indexedDbStorage`**:
  - Replaced synchronous 5MB `localStorage` with asynchronous browser IndexedDB store via `idb-keyval`.
  - Implements Zustand `StateStorage` interface (`getItem`, `setItem`, `removeItem`) with resilient in-memory fallback for SSR and restricted privacy modes.

#### Tri-Tier Zustand Store Architecture (`apps/console/src/lib/stores/`)

- **`session-slice`**: Active thread lifecycle, message history, streaming state, delta buffering, and agent selection.
- **`canvas-slice`**: Interactive Dual-Pane Workspace Canvas display modes (`code`, `preview`, `diff`, `terminal`), active draft artifact, and terminal output logging.
- **`execution-slice`**: DAG execution status, step waterfall telemetry, active node tracking, and token counters.
- **`clearance-slice`**: Pending Human-In-The-Loop (HITL) approval tickets, auto-sliding clearance drawer trigger on critical interrupts, and decision audit history.
- **Master `useConsoleStore`**: Unified hook combining all four slices with `persist` middleware targeting `indexedDbStorage`.

#### Quality Invariants & Validation

- **Hard 250-Line Rule**: 100% of files in `apps/console/src/lib/streaming/`, `src/lib/storage/`, and `src/lib/stores/` are strictly < 130 lines.
- **TypeScript**: `pnpm --filter @orchestrai/console typecheck` and monorepo `pnpm typecheck` passed cleanly across all 43 targets with 0 errors.

---

## Session: 2026-09-29 (Continued) — Phase 4 Complete: Intelligence Packages & Realtime Streaming Pipeline

### Phase 4 Completion Summary

#### Dynamic Model Router Package (`@orchestrai/model-router`)

- **Routing Engine & Strategies**:
  - Implemented `ModelRouter` supporting `RoutingStrategy` (`ROUND_ROBIN`, `LOWEST_LATENCY`, `LEAST_EXPENSIVE`, `PRIORITY_FALLBACK`).
- **Telemetry & Cost Estimation**:
  - `LatencyTracker`: Sliding-window circular buffer tracking empirical P50, P95, P99, and average latency per deployment candidate.
  - `CostEstimator`: Pre- and post-inference cost calculator computing financial token expenditure in USD based on model pricing tiers.
  - `FallbackCascade`: Fault-tolerant runner cascading through ranked deployment candidates upon `RouterFallbackReason` (`RATE_LIMITED`, `TIMEOUT`, `PROVIDER_UNAVAILABLE`, `CONTEXT_EXCEEDED`, `HTTP_ERROR`).

#### Tenant Billing & Budget Enforcement Package (`@orchestrai/billing`)

- **Token Counting**:
  - `TokenCounter`: Fast token estimation engine supporting raw text and structured chat message arrays with protocol framing overhead.
- **Append-Only Financial Ledger**:
  - `CostLedger`: Transactional ledger recording discrete token spend events (`BillingLedgerEntryType`: `PROMPT`, `COMPLETION`, `EMBEDDING`, `TOOL_EXECUTION`).
  - Summarizes tenant usage totals and token counts since billing period start.
- **Quota & Budget Enforcement**:
  - `BudgetEnforcer`: Enforces monthly spending limits, generating `BillingEnforcementAction` (`ALLOW`, `WARN`, `THROTTLE`, `BLOCK`) and `BudgetQuotaStatus` (`HEALTHY`, `WARNING`, `EXCEEDED`, `THROTTLED`).

#### Semantic Vector Cache Package (`@orchestrai/semantic-cache`)

- **Cosine Similarity Engine**:
  - `cosineSimilarity`: Zero-division protected vector dot-product computation.
- **Semantic Vector Cache**:
  - `SemanticCache`: Query deduplication engine matching prompt embeddings using strict similarity threshold (default `0.97`) and configurable TTL.
  - Automatic LRU capacity pruning and hit/miss telemetry tracking (`SemanticCacheStats`).

#### Distributed Realtime & Worker Brokerage

- Verified `apps/realtime` Redis Pub/Sub subscriber fan-out to connected SSE and WebSocket clients.
- Verified `apps/worker` BullMQ processing pipeline with `AgentExecutionWorker`, `ToolExecutionWorker`, and `DeadLetterWorker`.

#### Quality Invariants & Validation

- **Hard 250-Line Rule**: 100% of files in `@orchestrai/model-router`, `@orchestrai/billing`, and `@orchestrai/semantic-cache` are strictly < 150 lines.
- **Strict Enums**: Zero hardcoded strings; all actions, strategies, and hit states use canonical enums from `@orchestrai/shared-types`.
- **TypeScript**: `pnpm typecheck` passed across all 43 targets in the monorepo with 0 errors.

---

## Session: 2026-09-29 (Continued) — Phase 3 Complete: Dedicated Operator Control Plane Service (`apps/admin`)

### Phase 3 Completion Summary

#### Operator Control Plane Microservice (`apps/admin`)

- **Microservice Scaffolding**: Built `apps/admin` (port 4005) with ESM `tsup` compilation and strict path aliases (`@/*`).
- **Zero Hardcoded Strings & Canonical Role Enums**:
  - `OperatorRole` (`admin`, `operator`, `developer`, `viewer`, `system`) and `BudgetQuotaStatus` (`healthy`, `warning`, `exceeded`, `throttled`) in `packages/shared-types/src/enums/platform.enums.ts`.
  - Re-exported shared `TenantBudgetInfo` and `TenantRecord` in `@orchestrai/shared-types/src/platform.ts` and `@orchestrai/sdk`.
- **Environment & Header Configuration (Zero Hardcoded Header Strings)**:
  - Extracted all HTTP header names to `.env` and `.env.example`: `API_KEY_HEADER_NAME`, `ADMIN_API_KEY_HEADER_NAME`, `AUTH_HEADER_NAME`, `TENANT_HEADER_NAME`, `REQUEST_ID_HEADER_NAME`.
  - Added dedicated Admin environment variables: `ADMIN_PORT=4005`, `ADMIN_HOST`, `ADMIN_API_KEY`, `OPERATOR_JWT_SECRET`, `ADMIN_CORS_ORIGINS`.
  - Injected dynamic header resolution into `createAdminRequestContext`, `authenticateOperator`, and `handleAdminCors`.

#### Operator Authentication & Traffic Isolation

- **Operator Auth Guard** (`apps/admin/src/middleware/operator-auth.middleware.ts`):
  - Validates `X-Admin-Api-Key` or `X-API-Key` matching `ADMIN_API_KEY`.
  - Verifies Bearer token against dedicated `OPERATOR_JWT_SECRET`.
  - Enforces database operator role verification (`OperatorRole.OPERATOR` or `OperatorRole.ADMIN`), rejecting normal user tokens with `403 Forbidden` (`OPERATOR_ACCESS_REQUIRED`).
- **Dynamic CORS & Error Serialization**:
  - Preflight OPTIONS handler merging declared header keys with credentials support.
  - Standardized JSON error response serialization with RFC 7807 correlation `requestId`.

#### Operator Domain Services & Catalog Endpoints

- **Catalog Management Services**:
  - `LlmProviderAdminService`: Provider registrations with live model counts.
  - `LlmModelAdminService`: Deployment catalog with context window and provider relations.
  - `PlatformModeAdminService`: Autonomy mode definitions and approval enforcement policies.
  - `PlatformRoleAdminService`: Functional agent specialty domains.
  - `PlatformPermissionAdminService`: Security clearance tiers and approval requirements.
  - `PlatformToolAdminService`: Sandboxed tool registry and execution levels.
  - `TenantBudgetAdminService`: Real-time tenant monthly budget caps, token tracking, and throttling state.
- **REST Route Layer** (`apps/admin/src/routes/`):
  - Parameterized router (`AdminRouter`) supporting pattern matching, query parameter parsing, and JSON body parsing.
  - Full CRUD routes under `/platform/*`: `/platform/llm-provider`, `/platform/llm-model`, `/platform/platform-mode`, `/platform/platform-role`, `/platform/platform-permission`, `/platform/platform-tool`, `/platform/budgets/:tenantId`, `/platform/tenants`.
  - Health probes under `/health` and `/ready`.

#### Quality Invariants & Validation

- **Hard 250-Line Rule**: 100% of files in `apps/admin` are strictly < 155 lines (well below the 250 LOC threshold).
- **TypeScript**: `pnpm --filter @orchestrai/admin typecheck` and monorepo `pnpm typecheck` passed cleanly across all 40 targets with 0 errors.
- **Build**: `pnpm --filter @orchestrai/admin build` built cleanly in 51ms.

---

## Session: 2026-09-29 (Continued) — Phase 2 Complete: Dedicated DAG Execution Orchestrator Microservice

### Phase 2 Completion Summary

#### Dedicated Microservice Scaffolding (`apps/orchestrator`)

- **Package Configuration**: Created `package.json`, `tsconfig.json`, `tsup.config.ts` on port 4004 (HTTP health probes) and port 50051 (gRPC service).
- **Zero Hardcoded Strings & Canonical Enums**:
  - `PlatformScope`, `PlatformCapabilitySlug`, `PlatformToolName` in `packages/shared-types/src/enums/platform.enums.ts`.
  - `OrchestratorState`, `OrchestratorEventType`, `OrchestratorPubSubEventName` in `packages/shared-types/src/enums/orchestrator.enums.ts`.
  - Canonical execution defaults constants `AGENT_EXECUTION_DEFAULTS` in `packages/core/src/constants/execution-defaults.constants.ts`.

#### State Machine & Checkpointing Architecture

- **Execution State Machine** (`apps/orchestrator/src/state-machine/execution-state-machine.ts`):
  - Deterministic state machine governing transitions between `PENDING`, `DISPATCHED`, `COMPUTING`, `AWAITING_CLEARANCE`, `COMPLETED`, `FAILED`, and `CANCELLED`.
  - Strict guard conditions and state validation preventing illegal transitions.
- **Database Query Runner & Postgres Checkpointer** (`apps/orchestrator/src/checkpointer/database-query-runner.ts`):
  - Bridges `@orchestrai/database` connection pool with runtime `PostgresCheckpointer` without leaky node-pg dependencies.
  - Safe transactional snapshotting of LangGraph / dag execution state per tick.
- **Realtime Redis Publisher** (`apps/orchestrator/src/publisher/orchestrator-redis-publisher.ts`):
  - Publishes typed `OrchestratorPubSubEventName` events to Redis Pub/Sub channels (`orchestrai:realtime:execution:<id>`).

#### DAG Execution Engine & gRPC Dispatch Service

- **DAG Execution Engine** (`apps/orchestrator/src/runtime/dag-execution-engine.ts`):
  - Initializes `OrchestrAIRuntime` with Ollama adapter, tool registry, and checkpointing.
  - Step-by-step DAG progression with automatic HITL interrupt detection and event broadcasting.
- **gRPC Server & Execution Service** (`apps/orchestrator/src/grpc/grpc-execution.service.ts`):
  - Implements `IGrpcExecutionService` dispatching execution requests synchronously/asynchronously.
  - Fallback logic to Ollama adapter using strict platform capability and tool enums.
- **Microservice Entrypoint & Health** (`apps/orchestrator/src/server.ts`, `src/index.ts`):
  - Dual HTTP (Fastify, port 4004) and gRPC (port 50051) lifecycle with graceful SIGINT/SIGTERM shutdown.
- **Gateway Inversion**:
  - Updated `apps/gateway/src/modules/execution/execution-dispatcher.ts` to delegate execution directly to `apps/orchestrator` via `GrpcClient`.

#### Validation & Quality Gates

- `pnpm typecheck` passed across all 39 monorepo targets with 0 errors.
- `pnpm lint --max-warnings=0` passed cleanly with 0 warnings.
- All files strictly adhere to the < 250 LOC rule (highest LOC is 232).

---

## Session: 2026-09-29 (Continued) — Phase 1 Complete: Logging, JSDoc & Feature-Module Reorganization

### Phase 1 Completion Summary

#### Log-Rich Repository & Service Coverage

- **`PostgresExecutionRepository`**: Full structured log coverage — every method entry (`findById`, `create`, `updateStatus`, `list`, `cancel`), success paths, branch conditions (terminal state detection, tenant scoping), and all error boundaries wrapped in `try/catch` with `logger.error`.
- **`PostgresSessionRepository`**: Full log coverage — session creation, message append with FK stub execution warning, delete graceful degradation, list pagination debug output.
- **`ExecutionService`**: Full log coverage — execution dispatch entry, agent fallback path, repository port persistence confirmation, async queue dispatch vs live SSE branch, live SSE completion state persistence, unhandled rejection `.catch()` with `logger.error`.
- **Entity Mappers**: `execution-entity.mapper.ts` and `session-entity.mapper.ts` — comprehensive JSDoc, single-responsibility, < 100 LOC each.

#### Feature-Module Reorganization (`apps/gateway/src/modules/`)

- **Problem**: 43 flat service files + 22 route files + 19 controller files with no domain locality.
- **Solution**: Migrated into 13 feature modules under `src/modules/<domain>/`:
  - `auth/` — login, signup, token, crypto, password-reset
  - `execution/` — execution service, query service, status mapper, CQRS command handlers
  - `session/` — conversation threads + messages (3 services merged under session naming)
  - `agent/` — agent CRUD
  - `streaming/` — live SSE manager, turn executor, broadcaster, redis publisher, message history, autonomous runner, queue producer
  - `approval/` — HITL clearance service + resolve-approval command handler
  - `permission/` — resource access, RBAC, policy manager, DB grants, evaluator, registry
  - `platform/` — LLM models, providers, roles, tools, modes
  - `memory/` — memory CRUD
  - `rag/` — RAG ingestion + search
  - `eval/` — prompt evaluation
  - `nav/` — dynamic nav items
  - `trace/` — execution trace
  - `health/` — health probe routes
- **Migration**: `cp` + `sed` batch import path rewrites; all `@/services/`, `@/routes/`, `@/controllers/` aliases updated to `@/modules/<domain>/`. Backward-compatible barrel files left in `services/index.ts`, `controllers/index.ts`, `commands/index.ts`.
- **Legacy Purging**: Removed 70+ obsolete flat files from `apps/gateway/src/services/`, `apps/gateway/src/controllers/`, `apps/gateway/src/routes/`, and `apps/gateway/src/commands/`.
- **Hard 250-Line Rule Decomposition**:
  - Extracted `apps/gateway/src/repositories/session-message-store.ts` (< 115 LOC) from `PostgresSessionRepository` (now 217 LOC).
  - Extracted `apps/gateway/src/modules/execution/execution-dispatcher.ts` (< 190 LOC) from `ExecutionService` (now 187 LOC).
  - 100% of files in `apps/gateway` are now strictly < 250 LOC (max 245 LOC).
- **Validation**:
  - `pnpm --filter @orchestrai/gateway typecheck` → **0 errors** ✅
  - Monorepo `pnpm typecheck` across all 37 targets → **0 errors** ✅
  - Monorepo `pnpm lint --max-warnings=0` → **0 errors, 0 warnings** ✅

---

## Session: 2026-09-29 — Grand Unified Architecture Blueprint (Backend Hexagonal Decoupling & Frontend Dual-Pane Canvas)

### 1. Unified Architectural Synthesis

- Conducted deep architectural review from the perspective of Principal Systems and Product Architects at Google (DeepMind/Vertex), OpenAI (Platform/Canvas), and Anthropic (Claude Console/Artifacts).
- Unified backend service decoupling (`apps/orchestrator` for compiled DAG runtime, `apps/admin` for control plane, `apps/gateway` as thin ingress) and frontend modernization (`apps/console` dual-pane interactive canvas, 120 FPS RAF stream buffer, Zustand+IndexedDB tri-tier state).
- Mapped all 8 backend patterns (Ports & Adapters, CQRS Command/Query buses, Thin Shell inversion, `apps/orchestrator`, `packages/model-router`, `packages/billing`, `packages/semantic-cache`, `apps/admin`) and 6 frontend pillars (120 FPS stream engine, Tri-Tier state, Dual-Pane canvas, Virtualized chat feed, HITL clearance cockpit, Route Group consolidation) into a synchronized 8-phase execution roadmap.

### 2. Comprehensive Tracking & Session Continuity

- Produced definitive master plan: `master-architecture-plan.md` guaranteeing zero omissions from previous audits.
- Embedded complete 8-phase milestone checklist into `PROGRESS.md` (`Phase 0` through `Phase 8`) with explicit deliverables and tracking checkboxes to ensure seamless resumption across sessions or AI agents.
- Confirmed strict compliance with workspace invariants: 250-line rule, detailed JSDoc, explanatory inline comments, and zero test policy during feature implementation.

### 3. Completed Phase 0: Shared Domain Contracts, Ports & Enum Normalization

- **Strict Enum Typing & Zero Hardcoded Strings**:
  - Created `SseMessageRole`, `SseToolCallStatus`, `SseDoneStatus` in `@orchestrai/shared-types/enums/sse.enums.ts`.
  - Created `ExecutionCommandType`, `ApprovalCommandType`, `SessionCommandType`, `QueueBackoffType` in `@orchestrai/shared-types/enums/cqrs.enums.ts`.
  - Replaced all string literals in SSE payloads (`SseMessagePayload`, `SseToolCallPayload`, `SseDonePayload`), CQRS commands, and queue backoff configs with canonical enum keys.
- **Hexagonal Storage Ports (`@orchestrai/core/src/ports/`)**:
  - `IExecutionRepository` (`execution-repository.port.ts`)
  - `ISessionRepository` (`session-repository.port.ts`)
  - `IAgentRepository` (`agent-repository.port.ts`)
  - `IEventPublisher` (`event-publisher.port.ts`)
  - `IQueueProducer` (`queue-producer.port.ts`)
- **CQRS Command Pipeline (`@orchestrai/core/src/cqrs/`)**:
  - `ICommand`, `ICommandHandler`, `ICommandBus` (`command-bus.port.ts`)
  - `CreateExecutionCommand`, `CancelExecutionCommand` (`execution.commands.ts`)
  - `ResolveApprovalCommand` (`approval.commands.ts`)
  - `CreateSessionCommand`, `AppendMessageCommand`, `DeleteSessionCommand` (`session.commands.ts`)
- **SDK Resources (`@orchestrai/sdk/src/resources/`)**:
  - Mounted `AdminResource` (`admin.ts`) for operator control plane queries and budget metrics.
  - Mounted `RealtimeResource` (`realtime.ts`) for typed SSE streaming subscriptions (`subscribeToExecution`).
  - Added `adminUrl` configuration option to `OrchestrAIClientOptions`.
- **Quality Invariants**: Every single new file strictly < 110 LOC (hard 250-line rule passed). Comprehensive JSDoc on every symbol.

### 4. Progress on Phase 1: Gateway Hexagonal Decoupling & CQRS Handlers

- **Prisma Repository Adapters (`apps/gateway/src/repositories/`)**:
  - Built `PostgresExecutionRepository` implementing `IExecutionRepository`.
  - Built `PostgresSessionRepository` implementing `ISessionRepository`.
  - Built `PostgresAgentRepository` implementing `IAgentRepository`.
  - Built `RedisEventPublisherAdapter` implementing `IEventPublisher`.
  - Built `BullMQQueueProducerAdapter` implementing `IQueueProducer`.
- **CQRS Command Handlers (`apps/gateway/src/commands/`)**:
  - `CreateExecutionCommandHandler` (`create-execution.handler.ts`)
  - `CancelExecutionCommandHandler` (`cancel-execution.handler.ts`)
  - `ResolveApprovalCommandHandler` (`resolve-approval.handler.ts`)
  - `CreateSessionCommandHandler`, `AppendMessageCommandHandler`, `DeleteSessionCommandHandler` (`session.handlers.ts`)
- **ExecutionService Decoupling**:
  - Injected `IExecutionRepository`, `IQueueProducer`, and `IEventPublisher` ports into `ExecutionService`.
  - Replaced direct Prisma calls with port methods, reducing LOC from 230 down to 198 lines (< 250-line rule verified).

---

## Session: 2026-09-29 — Sticky Live Clearance Bar, Inline Decision Audit Log, Enum Normalization & Query Extraction

### 1. User Feedback & UX Improvements

- **Problem**: When the agent streams output and pauses for clearance or tool logs, prompts were buried in the message body requiring the user to constantly scroll up and down. Additionally, once an operator clicked a clearance button (Allow Once, This Chat, Always, Deny), there was no permanent inline audit trail of the decision.
- **Solution**:
  - Anchored `StudioLiveActivityBar` stickily at the bottom between the message scroll viewport and the command station.
  - Extracted `StudioLiveClearanceCard` for interactive clearance decisions at the user's focal point.
  - Suppressed the permission card in the message body during active streaming to eliminate duplicates.
  - Stamped `resolvedScope` and `resolvedAt` onto `StudioApprovalRequest` upon resolution.
  - Rendered a compact `ApprovalDecisionChip` in the message thread providing a permanent, scannable inline audit log (`Cleared (session) · <target> · 03:52 PM`).
  - Decomposed `StudioWorkspace` into `useStudioWorkspaceState` and `use-studio-workspace-state.types.ts` to maintain hard < 250 LOC rule.

### 2. Interleaved Chronological Message Segments Timeline

- **Problem**: When an agent executed multiple tools across turns (e.g. read `package.json` $\rightarrow$ generate analysis $\rightarrow$ ask clearance for `pnpm-workspace.yaml` $\rightarrow$ read `pnpm-workspace.yaml` $\rightarrow$ generate second analysis), all tool artifact cards and decision chips were stacked at the top of the message body, above the text from turn 1.
- **Solution**:
  - Introduced `MessageSegment` in `types.ts` representing discrete chronological steps: `thinking`, `plan`, `artifact`, `approval`, and `text`.
  - Added `segments?: MessageSegment[]` to `CoworkMessage`.
  - Implemented immutable `message-segment-utils.ts` and `execution-stream-consumer.ts` to append chunks and events into `segments` in exact arrival sequence.
  - Updated `StudioMessageItem` to iterate and render `message.segments` sequentially so tools, decisions, and markdown responses are interleaved chronologically.

### 3. Domain Enums Normalization & Query Consolidation

- Replaced bare union literals and raw strings with canonical shared enums across packages: `PermissionScope`, `ApprovalDecision`, `CoworkMode`, `PlanStepStatus`, `ArtifactType`, `CoworkMessageRole`, `SseStreamEvent`, `MessageSegmentType`.
- Unified SSE wire protocol event emissions and listeners (`SseStreamEvent.CHUNK`, `SseStreamEvent.MESSAGE`, `SseStreamEvent.ARTIFACT`, `SseStreamEvent.APPROVAL_REQUEST`, `SseStreamEvent.TOOL_CALL`, `SseStreamEvent.DONE`, `SseStreamEvent.ERROR`) across Gateway (`live-turn-executor.ts`, `live-execution.manager.ts`, `live-execution-broadcaster.ts`, `tool-approval-invoker.ts`) and Console (`execution-stream-consumer.ts`).
- Standardized message segment discriminator logic (`MessageSegmentType.THINKING`, `MessageSegmentType.PLAN`, `MessageSegmentType.ARTIFACT`, `MessageSegmentType.APPROVAL`, `MessageSegmentType.TEXT`) across `types.ts`, `message-segment-utils.ts`, and `studio-message-item.tsx`.
- Moved raw SQL queries into dedicated query files (`packages/runtime/src/hitl/storage/postgres-approval-queries.ts`, `packages/runtime/src/checkpoint/postgres-checkpoint-queries.ts`, `packages/database/src/query.ts`).
- Fixed `@orchestrai/database` re-export for `PermissionScopeType`.

### 4. Quality Gates

- **Line Invariant**: 100% of files strictly under 250 lines.
- **TypeScript**: `pnpm typecheck` passed with 0 errors across 37 targets.
- **ESLint**: `pnpm lint` passed with 0 warnings (`--max-warnings=0`).

---

## Session: 2026-09-29 — Multi-Turn HITL Clearance Resolution & SSE Heartbeat Continuity

### 1. Root Cause Analysis of "Stuck on Clearance Granted" in Multi-Turn Tool Loops

- **Symptom**: User prompted agent to inspect `package.json` and `pnpm-workspace.yaml` in sibling `finai` repo. `package.json` read fine. For `pnpm-workspace.yaml`, clearance card appeared, user granted clearance (`once`), but Studio remained stuck with a spinning stop button and no stream.
- **Root Causes Discovered**:
  1. **React State Desynchronization**: In `studio-message-item.tsx`, `<StudioPermissionCard request={message.approvalRequest} ... />` lacked a unique `key`. When the approval request changed between turns, React re-rendered the existing component whose internal `resolvedScope` state remained `"once"` from the previous turn, hiding the action buttons and freezing the UI in a resolved badge state.
  2. **SDK Scope Loss**: `useResolveApproval.ts` called `client.approvals.resolve(approvalId, { decision, reason })` without passing `scope`. The SDK resource interface `ResolveApprovalParams` also omitted `scope`. The Gateway consequently defaulted `scope` to `"once"`, preventing session-wide (`scope: "session"`) or permanent grants from persisting.
  3. **Session ID Desynchronization**: In `PermissionPolicyManager.createApprovalRequest`, `sessionId` was not captured on `ApprovalRequest`, causing session-scoped grants in `resolveApproval` to be keyed under `executionId` instead of `conversationId`, leading subsequent `checkPermission` calls in the turn loop to fail lookups.
  4. **SSE Idle Timeout During Approval Pauses**: HTTP proxies and browsers closed idle SSE streams when users paused on approval prompts. No keepalive bytes were emitted during the wait.
  5. **Confusing LLM Prompt Injection**: `read_file` tool output contained `[NOTE: Belongs to "${repo}". If targeting another project (e.g. "finai"), use "../<project>/..."]`, which confused the LLM into making duplicate file read requests in turn 3.

### 2. Engineering Changes Made

- **Console (`apps/console`)**:
  - `studio-message-item.tsx`: Added `key={message.approvalRequest.id}` to `StudioPermissionCard` to guarantee clean remounts for every approval request ticket.
  - `use-resolve-approval.ts`: Passed `scope` through in the mutation payload to `client.approvals.resolve`.
  - `use-agent-runner.ts`: Propagated clearance resolution errors rather than silently swallowing them.
- **SDK (`packages/sdk`)**:
  - `approvals.ts`: Added optional `scope: "once" | "session" | "permanent" | "deny"` to `ResolveApprovalParams`.
- **Gateway (`apps/gateway`)**:
  - `permission-types.ts`: Added `sessionId?: string` to `ApprovalRequest`.
  - `permission-policy.manager.ts`: Accepted `sessionId` in `createApprovalRequest`, implemented `getPendingApprovals()`, and applied session grants across `[sessionId, pending.request.sessionId, pending.request.executionId, "default"]`.
  - `tool-approval-invoker.ts`: Passed `sessionId` to `createApprovalRequest`, and preserved primary `workspaceRoot` as base directory in `executeWorkspaceTool`.
  - `approval.service.ts`: Implemented `listApprovals` returning in-memory pending approvals from `permissionPolicyManager.getPendingApprovals()`.
  - `live-execution-broadcaster.ts`: Added 15-second keepalive heartbeat ping (`: ping\n\n`) to `attachExecutionSseStream` with automatic timer cleanup.
  - `autonomous-agent-runner.ts`: Simplified `read_file` header to `[File: ... (Path: ...)]` to prevent confusing the LLM into making duplicate reads.
  - `resource-access-logger.ts`: Resolved `execution.agentId` when `params.agentId` is an execution ID to satisfy database foreign key integrity.

### 3. Quality Gates

- **Line Invariant**: All 11 modified files strictly under 250 lines (range: 49 to 244 lines).
- **TypeScript**: `pnpm typecheck` passed with 0 errors across 37 targets.
- **Linting**: `pnpm lint` passed with 0 warnings (`--max-warnings=0`).

---

## Session: 2026-09-23 — Universal Autonomous Cowork Platform & Zero-Docker Architecture

### 1. Universal Cowork Studio Redesign (`apps/console`)

- **Architecture**:
  - Re-architected console into a premier **Universal Autonomous AI Agent & Cowork Platform** inspired by Claude Cowork, ChatGPT Agent Mode, Antigravity, and OpenAI Codex.
  - Implemented multi-domain starter canvas supporting Deep Research, Technical Writing, Fullstack Software Engineering, and Strategic Data Analytics.
- **Components Built (< 190 lines each)**:
  - `studio-workspace.tsx` — Master coordinator and canvas.
  - `use-session-store.ts` — Threaded session store with URL sync (`/session/:sessionId`), auto-naming, and browser persistence.
  - `session-drawer.tsx` — Slide-out session history drawer with search, active highlight, three-dots action menu (`...`), and thread deletion.
  - `studio-header.tsx` — Clean toolbar with Specialist, Model, and Mode selectors, Threads toggle, Swarm status pill, and Inspector rail toggle.
  - `studio-thinking-block.tsx` — Collapsible reasoning drawer with duration timers.
  - `studio-plan-card.tsx` — Interactive execution plan checklist with real-time status badges.
  - `artifacts/` — Specialized visual renderers for Markdown documents (`artifact-document-card.tsx`), Code editor (`artifact-code-card.tsx`), Dark Terminal window (`artifact-terminal-card.tsx`), and Web search citations (`artifact-search-card.tsx`).
  - `studio-prompt-bar.tsx` — Auto-expanding floating command prompt with specialist/model pills and keyboard shortcuts (`⌘ + Enter`).
  - `studio-inspector-rail.tsx` — Live SSE event audit trail and telemetry monitor.
- **Light & Dark Theme System**:
  - `theme.tsx` — Context-based theme engine with localStorage persistence and system color mode detection.
  - `theme-toggle.tsx` — 1-click switcher in the 56px Navigation Rail.
- **Route Streamlining**:
  - Deleted dead/legacy routes (`activity`, `conversations`, `evaluations`, `events`, `knowledge`, `memory`, `workflows`) and centralized into 5 core product hubs.

---

### 2. Enterprise Database & Prisma ORM Pipeline (`packages/database`)

- **Prisma Schema & Migration**:
  - Created declarative `schema.prisma` with 15 production models (`tenants`, `users`, `agents`, `executions`, `execution_steps`, `tool_calls`, `conversations`, `messages`, `memory_items`, `documents`, `document_chunks`, `approvals`, `checkpoints`, `outbox`, and `_prisma_migrations`).
  - Applied initial migration `20260923083922_init` to native local PostgreSQL (`orchestrai_dev`).
- **Connection & Pooling**:
  - `client.ts` — Singleton Prisma Client using `@prisma/adapter-pg` driver adapter.
  - `pool.ts` — Native `pg.Pool` connection manager with timeout limits and graceful shutdown.
  - `health.ts` — Round-trip ping latency and pool metrics diagnostic probe.
  - `tenant-context.ts` — Row-level multi-tenant query isolation enforcement.
- **CLI Commands**:
  - Added root scripts: `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:studio`.

---

### 3. Zero-Docker Embedded Runtime Engine & Security

- **Eliminated Container Dependencies**:
  - Removed all `docker-compose` files and legacy `infrastructure/` directory.
  - Supported native local PostgreSQL on port `5432` (`postgresql://yuvarajpattabi:Yuva1213@localhost:5432/orchestrai_dev?schema=public`).
- **Zero-Docker Embedded Fallback**:
  - `local-store.ts` — Zero-docker embedded storage engine (`.data/orchestrai-local-store.json`) with file persistence and atomic reads/writes for offline development.
  - In-memory event bus fallbacks across `apps/realtime` and `apps/worker` when Redis is absent.
- **Secure Authentication & Zero-Seed Data**:
  - Completely removed hardcoded seed data, demo credentials, and default accounts.
  - All user passwords hashed using Node.js `scrypt` with unique per-user cryptographic salts.
  - Implemented HMAC-SHA256 signed bearer token issuance and validation.

---

### 4. Quality Gate & Invariant Verification

- **Hard 250-Line Maximum Rule**: 100% compliant across all files in `apps/` and `packages/` (< 200 lines per file).
- **Strict TypeScript**: `pnpm typecheck` passing with **0 errors** across all **30 targets**.

---

## Session: 2026-09-23 — Comprehensive Error Normalization & Authentication Messaging

### 1. Unified Error Normalization Engine (`apps/console`)

- **Root Cause Resolution**:
  - Replaced raw browser `TypeError: Failed to fetch` exceptions with friendly, contextual messaging across all client fetch wrappers.
  - Implemented `error-utils.ts` (`formatApiError`) to intercept network disconnects, server offline status, CORS blockages, and JSON parsing syntax errors.
  - Upgraded `auth-client.ts` with `safeAuthFetch` to safely decode server error payloads, extract error details, and fall back to status-appropriate messages (401, 404, 409).
- **UI Form Enhancements**:
  - `login-form.tsx` — Displays specific messages (e.g. `"No account found with this email address"`, `"Incorrect password. Please verify your credentials."`, or `"Unable to connect to the authentication server."`).
  - `signup-form.tsx` — Cleanly renders duplicate account conflict warnings and validation feedback.
  - `forgot-password-form.tsx` — Formats password recovery failures gracefully.
  - `use-api-data.ts` — Normalizes all gateway query errors before exposing to UI components.

### 2. Backend Authentication Decomposition & Clarification (`apps/gateway`)

- **Modular Architecture**:
  - Decomposed `auth.service.ts` into focused sub-modules: `auth-login.ts` and `auth-signup.ts` adhering strictly to the **Hard 250-Line Maximum Rule** (< 140 lines each).
  - Clarified login error paths: explicitly distinguishing between non-existent user accounts and incorrect password attempts.
  - Upgraded `auth.controller.ts` with `extractErrorMessage` to format Zod validation issues and runtime errors into clean API error responses.

### 3. TanStack Query Enterprise Architecture (`apps/console`)

- **Centralized Provider (`query-provider.tsx`)**:
  - Implemented `AppQueryProvider` with browser singleton management and production cache defaults (`staleTime: 60s`, `gcTime: 5m`, `retry: 1`, `refetchOnWindowFocus: false`).
- **Reactive Auth Mutations (`use-auth-mutations.ts`)**:
  - `useLoginMutation()` — TanStack mutation hook handling operator authentication with automatic error normalization.
  - `useSignupMutation()` — Mutation hook for workspace operator onboarding.
  - `useForgotPasswordMutation()` — Mutation hook for password recovery flows.
- **Cache Lifecycle & Cross-Tab Purging (`auth-context.tsx`)**:
  - Connected `queryClient.clear()` to `logout()` and cross-tab `AUTH_LOGOUT` broadcasts, guaranteeing zero cache leaks across user sessions.
- **Universal Query Hook Integration (`use-api-data.ts`)**:
  - Converted `useApiData` to be powered by TanStack Query's `useQuery` under the hood with scoped cache keys (`["agents"]`, `["tools"]`, `["models"]`, `["executions"]`), providing instant caching, deduplication, and refetch capabilities.

---

## Session: 2026-09-24 — Autonomous Multi-Turn Context & HITL Security Perimeter

### 1. Continuous Multi-Turn Dialogue Memory

- Upgraded `use-agent-runner.ts` to forward active conversation history (`role` and `content`) and `activeSessionId` to the gateway runtime via `client.agents.run`.
- Updated `CreateExecutionSchema` to validate `history` arrays.
- Reconstructed multi-turn message arrays in `LiveExecutionManager` (`live-execution.manager.ts`), seamlessly maintaining full conversation history across follow-up user turns (e.g. "sure", "add a dependency").

### 2. Multi-Workspace HITL Security Perimeter

- Enhanced `PermissionPolicyManager` (`permission-policy.manager.ts`) to manage 4-level capability scopes (`once`, `session`, `permanent`, `deny`).
- Decomposed persistent permissions storage into `permission-storage.ts` using `.orchestrai/permissions.json`.
- Fixed bash shell authorization evaluation and child process working directory anchoring for external repositories.

### 3. PostgreSQL Conversation & Message Persistence

- Updated `use-session-store.ts` to generate RFC-compliant UUIDs for session keys.
- Updated `ExecutionService` (`execution.service.ts` / `execution-query.service.ts`) to persist conversation threads and individual user/assistant turns in PostgreSQL `conversations` and `messages` tables.
- Verified zero TypeScript errors (`pnpm typecheck`) and zero ESLint warnings across all 32 workspace targets.

---

## Session: 2026-09-24 — Dynamic Modal Dialogs & Zero-Hardcoded Catalog Integration

### 1. Comprehensive Agent Creation Dialog (`AgentDialog`)

- Sourced and populated all missing specification fields in `buildAgentFields`: Agent Name, Role/Domain, Role Description, Model Engine, Autonomy Mode, Capabilities (comma-separated), Enabled Tools, Max Step Budget, and System Instructions / Persona.
- Connected `AgentDialog` to live database models via `useModels()` and platform modes via `usePlatformModes()`.
- Enhanced `useCreateAgentMutation` to pass `description`, `role`, `model`, `mode`, `capabilities`, `tools`, `maxSteps`, and `modelConfig` through to the gateway.
- Enforced zero hardcoded models or providers: removed static presets and fallbacks.

### 2. Tool Registration Dialog (`ToolDialog`)

- Extended `tool-form-fields.ts` to include 4-tier execution permissions (`READ_ONLY`, `WRITE_SAFE`, `SENSITIVE`, `DANGEROUS`) and functional category selections (`Web & Search`, `Documents & Data`, `Computation & APIs`, `Filesystem`, `Custom`).
- Passed structured permission policy and category into `useRegisterToolMutation`.

### 3. Model Configuration Dialog (`ModelDialog`)

- Added `isDefault` selection toggle to `model-form-fields.ts` to designate workspace default AI engines without manual database edits.
- Updated `useRegisterModelMutation` to accept and send `isDefault` to `POST /api/v1/models`.

---

## Session: 2026-09-24 — Feedback Design Tokens & Dynamic Tools Registry Redesign

### 1. Centralized Feedback Tokens in `@yuva-devlab/ui`

- **Design System Extraction**:
  - Recorded exact feedback tokens in `packages/ui/src/styles/themes/orchestrai.css`: `success` (`oklch(74% 0.14 160)` / `#47c58c`), `destructive` (`oklch(68% 0.18 25)` / `#f3625d`), `warning` (`oklch(81% 0.14 80)` / `#f0b648`), `info` (`oklch(72% 0.12 255)` / `#6fa7ee`).
  - Added Sonner toast semantic feedback styles to `packages/ui/src/styles/preset.css` and `styles.css`.
  - Added and exported `StatusBadge` directly from `@yuva-devlab/ui`.
  - Removed all hardcoded status color overrides from `apps/console/src/app/globals.css`.

### 2. Dynamic Tool Categories & Capability Cards Redesign

- **Removed Static Metrics**:
  - Dropped hardcoded `calls` and `avgLatency` (`120ms`) metrics from tool cards.
  - Dynamically grouped tools into category sections matching `orchestrai-src`: `Web & Search`, `Documents & Data`, `Computation & APIs`, `Filesystem`.
- **Capability Cards with Interactive Toggle**:
  - Added interactive `<Switch checked={tool.isEnabled} />` connected to live gateway mutation (`PUT /api/v1/tools/:id`) with `toast.promise`.
  - Rendered permission badge (`Auto-run`, `Ask first`) and containment badge (`Network read`, `Read only`, `Workspace write`, `Ephemeral VM`).
  - Unified tag typography and color (`bg-secondary text-secondary-foreground text-xs`) so neither tag appears greyed out or inactive.

### 3. Dynamic Studio Specialist Resolution from Database

- **Removed Static Specialists**:
  - Removed hardcoded `DEFAULT_SPECIALISTS` static array and completely purged `specialists-data.ts`.
  - Replaced with dynamic database query (`useAgents()`) in `studio-workspace.tsx`.
- **Database Seeding**:
  - Inserted rich multi-domain specialist personas into PostgreSQL `agents` table: Lead Orchestrator, Deep Research Specialist, Strategic Document Author, Fullstack Systems Architect, Data & Insights Analyst, Workflow Automator.
- **Execution Target Alignment**:
  - Updated `use-agent-runner.ts` to look up and dispatch specifically to the selected database agent UUID (`activeSpecialist.id`), ensuring complete end-to-end integration between Studio UI selections and PostgreSQL persistence.

### 4. Zero Hardcoded Architecture Guarantee (Milestone 9)

- **Purged All Phantom Fallbacks**:
  - Deleted `specialists-data.ts` and purged fallback exports from `apps/console/src/features/studio/index.ts`.
  - Updated `use-session-store.ts` to initialize sessions without phantom `"orchestrator"` string or `"autonomous"` mode.
  - Updated `studio-workspace.tsx` to bind `activeSpecialist` purely from `specialists.find(...) || specialists[0]`.
  - Updated `use-agent-runner.ts` to eliminate fallback agent auto-creation and reject operations without valid tenant partition.
  - Updated `account-session-card.tsx` to eliminate `"default"` tenant string fallback.
- **Complete Invariant Compliance**:
  - All files strictly adhere to the hard 250-line rule (`studio-workspace.tsx`: 214 lines, `use-agent-runner.ts`: 248 lines, `use-session-store.ts`: 232 lines).
  - Monorepo typecheck passed: 32/32 targets successful.

### 5. PostgreSQL `agents.mode` Lowercase Snake_case Normalization

- **Database Enum Normalization**:
  - Renamed PostgreSQL `AgentMode` enum values in `orchestrai_dev` to lowercase: `'chat'`, `'plan'`, `'act'`, `'auto'`.
  - Updated all existing rows in `agents` table to lowercase snake_case (`auto`, `plan`, `act`).
- **Prisma Schema & Domain Contracts**:
  - Updated `enum AgentMode` in `packages/database/prisma/schema.prisma` to lowercase (`chat`, `plan`, `act`, `auto`) and regenerated Prisma client.
  - Updated `packages/shared-types/src/enums.ts` to map string values to lowercase (`CHAT = "chat"`, etc.).
  - Updated `apps/gateway/src/services/agent.service.ts` and `apps/console/src/features/agents` to parse, store, and validate lowercase mode values.

---

## Session: 2026-09-24 — Complete All-Enum Lowercase Snake_case Normalization

### 1. Prisma Schema Full Enum Alignment

- **Updated `packages/database/prisma/schema.prisma`**:
  - `ExecutionStatus`: `PENDING→pending`, `RUNNING→running`, `SUSPENDED→suspended`, `COMPLETED→completed`, `FAILED→failed`, `CANCELLED→cancelled`, `TIMED_OUT→timed_out`
  - `MessageRole`: `SYSTEM→system`, `USER→user`, `ASSISTANT→assistant`, `TOOL→tool`
  - `ApprovalStatus`: `PENDING→pending`, `APPROVED→approved`, `REJECTED→rejected`, `TIMED_OUT→timed_out`
  - `ToolPermissionLevel`: `READ_ONLY→read_only`, `WRITE_SAFE→write_safe`, `SENSITIVE→sensitive`, `DANGEROUS→dangerous`
  - `OutboxStatus`: `PENDING→pending`, `PUBLISHED→published`, `FAILED→failed`
  - `PlatformScope`: `PLATFORM→platform`, `TENANT→tenant`
  - All `@default()` column references updated (e.g. `@default(pending)`, `@default(read_only)`, `@default(platform)`).
- **Regenerated Prisma client** (`pnpm db:generate`) — TypeScript types now emit lowercase enum values.

### 2. Gateway Service Layer Updates

- **`execution-status.mapper.ts`**: `toPrismaStatus` normalizes via `toLowerCase()` for backward compat; `toSharedStatus` matches lowercase DB values. Added `timed_out` mapping.
- **`execution.service.ts`**: Replaced `"RUNNING"`, `"USER"`, `"ASSISTANT"` → `"running"`, `"user"`, `"assistant"`.
- **`execution-query.service.ts`**: Replaced `"CANCELLED"`, `"RUNNING"` → `"cancelled"`, `"running"`.
- **`conversation.service.ts`**: Replaced `"COMPLETED"` → `"completed"`; `role.toUpperCase()` → `role.toLowerCase()`.

### 3. Shared Types Alignment

- **`packages/shared-types/src/enums.ts`**:
  - `ExecutionStatus`: All values now lowercase. Removed redundant `CREATED` member (was identical value `"pending"` as `QUEUED`) to satisfy `@typescript-eslint/no-duplicate-enum-values`.
  - `ApprovalStatus`: All values lowercase (`pending`, `approved`, `rejected`, `timed_out`).
  - `ToolPermissionLevel`: `"read_only"`, `"write_safe"`, `"sensitive"`, `"dangerous"`.
- **`packages/core/src/executions/execution-status.schema.ts`**: Removed `[ExecutionStatus.CREATED]` key from `VALID_TRANSITIONS` (duplicate computed property; both resolved to `"pending"`).

### 4. Quality Gate

- `pnpm typecheck`: **32/32 targets passing, 0 errors**.
- Pre-commit hooks (ESLint + Prettier): **0 warnings, 0 errors**.
- All files strictly under 250-line limit.

---

## Session: 2026-09-25 — Fix CI Pipeline Prisma Client Generation & Database Typecheck

### 1. Root Cause

- In CI (`.github/workflows/ci.yml`), `pnpm typecheck` was run right after `pnpm install --frozen-lockfile` without generating the Prisma client.
- In Prisma 7, `@prisma/client` does not automatically run `prisma generate` during install, leaving `@prisma/client` without generated types and causing `@orchestrai/database#typecheck` to fail with exit code 2 (`error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'`).

### 2. Resolution

- **CI Workflow**: Added `🗄️ Generate Prisma Client` (`pnpm db:generate`) step in `.github/workflows/ci.yml` before lint, typecheck, and build steps.
- **Database Scripts**: Updated `packages/database/package.json` to generate Prisma client prior to `typecheck` and `build`. Aligned Prisma dependencies to `^7.10.0`.
- **Install Automation**: Added `"postinstall": "pnpm db:generate"` to root `package.json` and added `"@prisma/client": true` to `allowBuilds` in `pnpm-workspace.yaml`.
- **Quality Gates**: All 32 turbo typecheck tasks passed with 0 errors, 21 packages built cleanly, and ESLint / Prettier passed with 0 warnings.

---

## Session: 2026-09-26 — System-Wide Access, Multi-Root Sandboxing & Sensitive File Protection (Milestone 10)

### 1. Architectural Motivation

- Previously, tool operations (`read_file`, `write_file`, `list_dir`, `bash`) were strictly jailed inside `workspaceRoot`. Any attempt to access external paths or user repositories threw a hard `POLICY_VIOLATION` exception.
- Furthermore, accessing sensitive credentials (`.env`, `~/.ssh/id_rsa`, AWS tokens) had no dedicated classifier, risking accidental exposure.

### 2. Implementation Details

- **Threat & Credential Classification (`packages/tools/src/security/sensitive-path.detector.ts`)**:
  - Implemented `classifyPathSensitivity` detecting critical credentials (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gcloud`, `~/.kube`, `id_rsa`, `*.pem`, `*.key`) and secrets (`.env`, `.npmrc`, `credentials.json`).
  - Implemented `expandUserHome` for expanding `~` paths to the operator's home directory.
- **Multi-Root Dynamic Sanitizer (`packages/tools/src/security/path-sanitizer.ts`)**:
  - Upgraded `sanitizePath` to accept `allowedRoots: string | readonly string[]`, verifying canonical path containment across all approved boundaries (`workspaceRoot` + session grants + permanent grants).
- **Tool Execution Context (`packages/tools/src/interfaces/tool.interface.ts`)**:
  - Extended `ToolExecutionContext` with `allowedRoots?: readonly string[]` and updated filesystem tools (`read_file`, `write_file`, `list_dir`).
- **HITL Permission Manager (`apps/gateway/src/services/permission-policy.manager.ts`)**:
  - Extracted type definitions to `permission-types.ts` to strictly maintain the 250-line rule.
  - Intercepts sensitive files (even inside the workspace) and external system directories, generating interactive approval requests with risk ratings.
- **Studio Interactive Clearance UI (`apps/console/src/features/studio/components/studio-permission-card.tsx`)**:
  - Styled high-risk requests with rose/red alert styling, "Protected File" badge, and clear danger explanations.
- **System-Wide Prompt Awareness (`packages/prompts/src/system/autonomous-tools.prompt.ts`)**:
  - Directed autonomous agents to formulate tool calls for external system paths and inform operators that clearance dialogs will be triggered.

### 3. Quality Gate Compliance

- All 32/32 monorepo typecheck targets passed (`pnpm typecheck`).
- ESLint passed with 0 warnings (`pnpm lint`).
- 100% of modified files strictly comply with the 250-line rule.

---

## Session: 2026-09-26 — Distributed Enterprise Architecture End-to-End Implementation

### 1. Architectural Scope & Problem Statement

- OrchestrAI had built out 17 packages (`@orchestrai/*`) and 4 apps (`console`, `gateway`, `realtime`, `worker`), but several components (BullMQ background queues, Redis Pub/Sub, RAG pipelines, episodic memory, telemetry tracing, benchmark eval) were operating in isolation or using stub implementations.
- The objective was to connect all components end-to-end into a distributed, Google/Anthropic-grade architecture while adhering to zero-Docker local execution (native Redis 6379, Postgres 5432) and strict quality invariants.

### 2. Implementation Deliverables

- **Realtime Redis Pub/Sub Event Backbone**:
  - `apps/gateway/src/services/live-execution-redis-publisher.ts`: Broadcasts live LLM generation deltas, tool executions, artifacts, and approval requests to Redis channel `orchestrai:realtime:execution:<executionId>`.
  - `apps/realtime`: Listens to Redis Pub/Sub patterns and fans out Server-Sent Events (SSE) and WebSockets to connected Console and SDK listeners.
- **BullMQ Background Worker Offloading**:
  - `apps/gateway/src/services/agent-execution-queue.producer.ts`: Enqueues asynchronous agent tasks via `AgentExecutionProducer` into BullMQ.
  - `apps/gateway/src/services/execution.service.ts`: Routes `async`/`background` mode requests to BullMQ queues while streaming live requests interactively.
  - `apps/worker`: Daemon runs `AgentExecutionWorker` polling BullMQ with `OrchestrAIRuntime` DAG execution.
- **Production RAG Pipeline Integration (`@orchestrai/rag`)**:
  - `apps/gateway/src/services/rag.service.ts`: Replaced mock stubs with real `RagPipeline` orchestrating chunking, dual Ollama/Mock embedding providers, and vector retrieval.
  - `packages/tools/src/builtins/search/knowledge-search.tool.ts`: Added built-in `knowledge_search` tool allowing autonomous agents to query ingested knowledge bases.
  - Wired into `apps/gateway/src/services/autonomous-agent-runner.ts` and `autonomous-tools.prompt.ts`.
- **Episodic Cross-Session Memory (`@orchestrai/memory`)**:
  - `apps/gateway/src/services/memory.service.ts`: Created unified enterprise memory service.
  - `apps/gateway/src/services/live-turn-executor.ts`: Automatically recalls prior memories before turn loops and records completed execution episodes for continuous learning.
- **OpenTelemetry Observability & Resilience (`@orchestrai/observability` & `@orchestrai/resilience`)**:
  - `apps/gateway/src/services/live-turn-executor.ts`: Records execution and turn spans using `getTracer()`.
- **Agent Capability Evaluation (`@orchestrai/eval`)**:
  - `apps/gateway/src/services/eval.service.ts`: Pre-configured evaluation suite scoring model tool-calling accuracy.
  - `apps/gateway/src/controllers/eval.controller.ts` & `apps/gateway/src/routes/eval.route.ts`: Exposes `/api/v1/eval/datasets` and `/api/v1/eval/run`.

### 3. Invariant & Quality Gate Verification

- **Hard 250-Line Maximum Rule**: 100% of files across all `apps/` and `packages/` are strictly < 250 lines. Decomposed `live-execution.manager.ts` (92 lines), `live-turn-executor.ts` (208 lines), and `live-message-history.ts` (66 lines).
- **Strict TypeScript**: `pnpm typecheck` passed with **0 errors across all 37 targets**.
- **Zero ESLint Warnings**: `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).

---

## Session: 2026-09-26 — Phase 13: Knowledge, Memory, Evaluations Hubs & ChatGPT-Style File Attachment

### 1. Architectural Scope & Problem Statement

- User requested "both" directions:
  1. The 3 missing product hubs in Console:
     - `/knowledge`: RAG Knowledge Base management, document catalogue, hybrid query tester.
     - `/memory`: Cross-session memory viewer, episodic reflections timeline, learned facts with importance scores.
     - `/evaluations`: Benchmark evaluation runner, dataset selection, accuracy gauge, latency breakdown.
  2. Studio chat input bar ChatGPT-style `+` button: On click, opens file upload UI, indexes document directly into RAG backend (`POST /api/v1/rag/documents`), and displays an attached document chip above the composer.
  3. Feature enhancements:
     - Observability waterfall in `/executions/[executionId]` rendering OpenTelemetry spans.
     - Dynamic database seeding and navigation items for new hubs.

### 2. Implementation Deliverables

- **ChatGPT-Style File Attachment (`apps/console/src/features/studio/components/`)**:
  - `studio-file-attachment.tsx`: Created `+` button trigger and `StudioAttachedFilesList` badge pills with auto-ingestion into `POST /api/v1/rag/documents`.
  - `studio-prompt-bar.tsx` & `studio-prompt-bar-selectors.tsx`: Integrated file upload trigger and attached file chips while decomposing selectors into a dedicated sub-component to strictly respect the 250-line rule (both files < 200 lines).
- **RAG Knowledge Base Hub (`apps/console/src/features/knowledge/` & `/knowledge`)**:
  - `types.ts`, `api/knowledge.api.ts`: React Query hooks for document CRUD and live hybrid vector search testing.
  - `components/knowledge-upload-dialog.tsx`: FormDialog for ingesting text/markdown/json documents.
  - `components/knowledge-query-tester.tsx`: Interactive hybrid vector search playground with similarity score meters.
  - `components/knowledge-documents-table.tsx`: Table listing indexed documents with deletion capability.
  - `components/knowledge-page-content.tsx` & `apps/console/src/app/(dashboard)/knowledge/page.tsx`: Main route page.
  - `apps/gateway/src/services/rag.service.ts`: Added `listDocuments` and `deleteDocument` methods.
- **Cross-Session Agent Memory Hub (`apps/console/src/features/memory/` & `/memory`)**:
  - `types.ts`, `api/memory.api.ts`: React Query hooks for memory listing, fact creation, searching, and deletion.
  - `components/memory-create-dialog.tsx`: Modal for recording persistent facts and user preferences.
  - `components/memory-search-tester.tsx`: Semantic recall testing matching runtime agent prompt synthesis.
  - `components/memory-items-list.tsx`: List of memories with importance meters, memory types, and deletion controls.
  - `components/memory-page-content.tsx` & `apps/console/src/app/(dashboard)/memory/page.tsx`: Main route page.
  - `apps/gateway/src/controllers/memory.controller.ts`: Added `create` endpoint (`POST /api/v1/memory`).
- **Capability Evaluations Hub (`apps/console/src/features/evaluations/` & `/evaluations`)**:
  - `types.ts`, `api/evaluations.api.ts`: Hooks for dataset retrieval and running model benchmarks.
  - `components/evaluations-runner-card.tsx`: Model benchmark execution launcher.
  - `components/evaluations-results-display.tsx`: Scorecard with accuracy gauge, passed items count, and mean latency.
  - `components/evaluations-datasets-list.tsx`: Dataset catalogue displaying test cases and expected tool assertions.
  - `components/evaluations-page-content.tsx` & `apps/console/src/app/(dashboard)/evaluations/page.tsx`: Main route page.
- **OpenTelemetry Distributed Tracing Waterfall (`apps/console/src/features/executions/`)**:
  - `api/use-execution-trace.ts`: Hook querying `GET /api/v1/traces/:executionId`.
  - `components/execution-trace-waterfall.tsx`: Visual timeline waterfall calculating relative span start offsets, duration widths, status pills, and expandable attribute inspectors.
  - Embedded into `execution-detail-page-content.tsx`.
- **Navigation Seeding & Icon Mapping**:
  - `nav-item.service.ts`: Added idempotent database seeding for `Knowledge`, `Memory`, and `Evaluations`.
  - `nav-icon-mapper.ts`: Mapped `BookOpen`, `Brain`, and `BarChart2`.

### 3. Invariant & Quality Gate Verification

- **Hard 250-Line Maximum Rule**: 100% of files across all `apps/` and `packages/` are strictly < 250 lines (all newly created components are < 200 lines).
- **Strict TypeScript**: `pnpm typecheck` passed with **0 errors across all 37 targets**.
- **Zero ESLint Warnings**: `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).
- **Zero Ad-Hoc Theme Colors**: 100% semantic CSS theme tokens (`text-warning`, `border-border`, `bg-card`, `text-primary`). Zero hardcoded colors.
- **Testing Policy Adherence**: Zero test cases or Storybook stories implemented during feature delivery.

---

## Session: 2026-09-26 — API Hook Standardization, Shared Enums, Single-Toolbar Redesign & RFC UUID Compliance

### 1. Architectural Scope & Problem Statement

- User feedback identified:
  1. Direct API calls in `.tsx` components: Calling routes directly in components violated project conventions. Replaced with modular `use-*.ts` hook files under `features/<feature>/api/`.
  2. UI layout flaw in Knowledge & Memory hubs: Nested duplicate search bars (tester box with search bar stacked directly on top of the document filter toolbar).
  3. Broken search icon and padding: Manual `relative`/`absolute` icon placement overlapped input text; needed to match the canonical `/agents` layout with `startIcon={<Search className="size-3.5" />}`.
  4. Hardcoded non-UUID formats: `"d1a10001-0000-0000-0000-000000000001"` in `eval.service.ts` violated RFC 4122 v4 UUID specification and failed Zod `.uuid()` validation.
  5. String comparison normalization: Shared string literals replaced with typed enumerations in `@orchestrai/shared-types`.

### 2. Implementation Deliverables

- **Single-Toolbar UI Standard (Aligned with `/agents`)**:
  - `KnowledgePageContent` & `MemoryPageContent`: Purged inline tester boxes and eliminated duplicate nested search bars.
  - Implemented the canonical single toolbar row: Left side contains `<div className="w-full sm:w-72"><Input startIcon={<Search className="size-3.5" />} className="bg-card h-8 text-xs" /></div>`; right side contains rounded-full category filter pills.
  - Converted testing functionality into dedicated modal dialogs:
    - `apps/console/src/features/knowledge/components/knowledge-query-dialog.tsx`: Triggered by "Test query" action button.
    - `apps/console/src/features/memory/components/memory-recall-dialog.tsx`: Triggered by "Test recall" action button.
  - Deleted obsolete inline tester components (`knowledge-query-tester.tsx`, `memory-search-tester.tsx`).
- **RFC 4122 UUID Standard Compliance**:
  - `apps/gateway/src/services/eval.service.ts`: Replaced hardcoded non-UUID strings (`"d1a10001-..."`, `"eval-msg"`) with standard `randomUUID()` from `node:crypto`.
  - Validated built-in datasets with `EvaluationDatasetSchema.parse(...)` to guarantee runtime schema adherence.
- **Shared Enum Modularization**:
  - Decomposed `packages/shared-types/src/enums.ts` (previously 210 lines) into focused sub-modules:
    - `enums/core.enums.ts`: Core lifecycle enums (`AgentMode`, `ExecutionStatus`, `StepType`, etc.).
    - `enums/hub.enums.ts`: Hub enums (`MemoryType`, `DocumentUploadStatus`, `TraceSpanStatus`, `DocumentMimeType`, `BenchmarkDatasetName`, `EpisodeOutcome`).
    - `enums/security.enums.ts`: Security enums (`PermissionScope`, `ApprovalRiskLevel`).
    - `enums/studio.enums.ts`: Studio enums (`ArtifactType`, `ArtifactStatus`, `PlanStepStatus`).
  - Updated `apps/gateway/src/services/permission-types.ts`, `apps/gateway/src/services/approval.service.ts`, `apps/gateway/src/services/live-turn-executor.ts`, and `apps/console/src/features/studio/types.ts` to consume canonical enums instead of raw strings.
- **Modular API Hooks**:
  - Decomposed monolithic API files into dedicated single-purpose hooks under `features/<feature>/api/` (`use-upload-document.ts`, `use-ingest-document.ts`, `use-knowledge-documents.ts`, `use-delete-document.ts`, `use-query-knowledge.ts`, `use-memories.ts`, `use-create-memory.ts`, `use-delete-memory.ts`, `use-search-memories.ts`, `use-evaluation-datasets.ts`, `use-run-benchmark.ts`).

### 3. Invariant & Quality Gate Verification

- **Hard 250-Line Maximum Rule**: 100% of files across all `apps/` and `packages/` are strictly < 250 lines (all files < 210 lines).
- **Strict TypeScript**: `pnpm typecheck` passed with **0 errors across all 37 targets**.
- **Zero ESLint Warnings**: `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).

---

## Session: 2026-09-26 — Real-Time Cross-Origin SSE Streaming & W3C Token Parser Compliance

### 1. Architectural Scope & Problem Statement

- User encountered:
  1. Failed SSE stream connection: `http://localhost:4002/api/v1/stream?executionId=...` failing with `Referrer policy strict-origin-when-cross-origin` in the browser.
  2. Non-streaming fallback behavior: Tokens did not stream incrementally into the UI, appearing all at once after a delay ("just come in instant").

### 2. Root Cause Analysis

1. **CORS Preflight Header Rejection**:
   - The browser at `http://localhost:3001` dispatched a cross-origin `fetch` to `http://localhost:4002/api/v1/stream`. The SDK client attached `X-Tenant-ID`.
   - Browser initiated a CORS preflight `OPTIONS` request. `apps/realtime/src/server/http-router.ts` previously only allowed `Authorization, Content-Type, Accept` in `Access-Control-Allow-Headers`, omitting `X-Tenant-ID`.
   - Browser aborted the request on CORS preflight rejection (`(failed)` / `strict-origin-when-cross-origin`).
2. **Instant Polling Fallback**:
   - In `apps/console/src/features/studio/hooks/use-agent-runner.ts`, when `handle.stream()` threw due to the CORS rejection, the catch block fell back to `handle.wait(1500, 30000)`, polling the Gateway until completion and dumping the full final output into message content simultaneously.
3. **Whitespace Token Stripping**:
   - In `packages/sdk/src/streaming/sse-parser.ts`, `rawValue.trim()` aggressively stripped leading and trailing spaces from incoming SSE lines, turning standalone whitespace tokens (e.g. `" "`) into empty strings and collapsing inter-word spacing.
4. **Indefinite Stream Keep-Alive**:
   - `apps/realtime` did not call `res.end()` on completion (`done`/`error`), leaving connections held open by keepalive pings.
   - `use-agent-runner.ts` lacked an explicit `break;` on completion signals (`done` event or `[DONE]` token).

### 3. Implementation Deliverables

- **Realtime Server CORS Preflight & Transport Optimization**:
  - `apps/realtime/src/server/http-router.ts`:
    - Updated `handleOptions` to reflect requested headers or provide comprehensive default CORS headers: `Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Tenant-ID, x-tenant-id, X-Request-ID, Idempotency-Key, Last-Event-ID, Cache-Control`.
    - Added `Access-Control-Allow-Credentials: true` and dynamic origin matching for all development localhost/127.0.0.1 ports.
  - `apps/realtime/src/sse/sse-channel.ts` & `sse-handler.ts`:
    - Configured explicit `res.flushHeaders()`, `res.socket?.setNoDelay(true)` to bypass Nagle's algorithm and flush SSE chunks immediately to the network.
    - Added `if (eventName === "done" || eventName === "error") res.end()` to cleanly close the response stream when execution concludes.
- **W3C Standard Compliance in SDK SSE Parser**:
  - `packages/sdk/src/streaming/sse-parser.ts`:
    - Replaced `rawValue.trim()` with standard W3C single-space strip (`if (rawValue.startsWith(" ")) rawValue = rawValue.slice(1)`).
    - Preserved whitespace and newline tokens essential for markdown and text formatting.
- **Studio Stream Termination & Approval Hook Modularization**:
  - `apps/console/src/features/studio/hooks/use-agent-runner.ts`:
    - Added immediate loop termination `if (sse.event === "done" || sse.data === "[DONE]") break;`.
    - Extracted approval resolution mutation into `apps/console/src/features/studio/api/use-resolve-approval.ts` per modular API hook architecture guidelines.
    - Brought `use-agent-runner.ts` line count down from 252 to 227 lines (< 250 line limit).

### 4. Quality Verification

- **Real-Time Stream Verification**:
  - Tested `OPTIONS /api/v1/stream` via `curl` with `Origin: http://localhost:3001` and `Access-Control-Request-Headers: x-tenant-id,authorization,content-type` -> returns `204 No Content` with complete CORS headers.
  - Tested `GET /api/v1/stream?executionId=test-exec-123` via `curl` -> connects instantly with `200 OK`, `Content-Type: text/event-stream`, and initial handshake event.
- **Strict TypeScript & ESLint**:
  - `pnpm typecheck` passed with **0 errors across all 37 targets**.
  - `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).

---

## Session: 2026-09-26 — Default-Collapsed Tool Artifacts & Process Execution Safety

### 1. Architectural Scope & Problem Statement

- User feedback identified:
  1. Execution hang during search commands: When commands like `grep -r` traversed heavy directories like `node_modules`, executions timed out or hung without clear progress or graceful recovery.
  2. Uncollapsed tool calls cluttering chat: By default, tool call artifacts (Terminal outputs, Code blocks, Documents, Search citations) were rendered in full expansion, displaying hundreds of lines of raw JSON, terminal dumps, and file contents.

### 2. Implementation Deliverables

- **Default-Collapsed Artifact Cards**:
  - `apps/console/src/features/studio/components/artifacts/artifact-terminal-card.tsx`: Added `isExpanded` state (default `false`), interactive header button with `Terminal` icon, title, `exit 0` badge, copy action, and "Show"/"Hide" chevron toggle.
  - `apps/console/src/features/studio/components/artifacts/artifact-code-card.tsx`: Added `isExpanded` state (default `false`), header button with `Code2` icon, title, path, language/lines badge, copy button, and expand toggle.
  - `apps/console/src/features/studio/components/artifacts/artifact-document-card.tsx`: Added `isExpanded` state (default `false`), header button with `FileText` icon, title, word count, download/copy actions, and expand toggle.
  - `apps/console/src/features/studio/components/artifacts/artifact-search-card.tsx`: Added `isExpanded` state (default `false`), header button with `Search` icon, title, source count badge, and expand toggle.
- **Safe Process Termination & Timeout Handling**:
  - `packages/tools/src/builtins/system/bash.tool.ts`: Hardened execution callback to handle timeouts and signal terminations gracefully. Returns standard POSIX exit code 124 on timeout instead of unhandled promise rejection.
- **Autonomous Prompt Search Guidance**:
  - `packages/prompts/src/system/autonomous-tools.prompt.ts`: Instructed agents to always exclude `node_modules` and `.git` during shell searches and to look in sibling directories (`../<project-name>`) when searching for external projects or repositories like `finai`.

### 3. Invariant & Quality Gate Verification

- **Hard 250-Line Maximum Rule**: All updated files strictly under 140 lines.
- **Strict TypeScript**: `pnpm typecheck` passed with **0 errors across all 37 targets**.
- **Zero ESLint Warnings**: `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).

---

## Session: 2026-09-26 — Multi-Repository Trust Boundaries & Provenance-Guarded Anti-Hallucination

### 1. Architectural Scope & Problem Statement

- User encountered:
  1. The AI was sometimes asking for permission and sometimes not.
  2. Even though the user asked for files from external projects (e.g. `finai/package.json`), the AI read `package.json` from the active repository (`orchestrai`) without requesting clearance and hallucinated that it was the `finai` project.

### 2. Root Cause Analysis

1. **Bare Relative Path Ambiguity**:
   - The agent was not informed of its active repository identity (`orchestrai`).
   - When the user requested "Access finai package.json", the agent blindly emitted `{"tool": "read_file", "args": {"path": "package.json"}}` based on prompt template examples.
   - Because `"package.json"` was resolved relative to `workspaceRoot` (`orchestrai`), it fell inside the trusted root; `checkPermission` marked it `allowed: true` and skipped HITL clearance.
2. **Missing Workspace & Sibling Awareness in System Prompt**:
   - The system prompt did not inform the model of the active repository name or that sibling projects (such as `finai`, `devlab-shared`, etc.) live in the parent directory (`../<repo>`).
3. **Missing Tool Output Provenance**:
   - `read_file` only returned raw file content, giving the LLM no feedback on which directory on disk was actually read, causing it to assume the output matched the user's intended project.
4. **Candidate Path Resolution Limitation**:
   - If the agent passed `path: "finai/package.json"`, it attempted to resolve inside `orchestrai/finai/` (which did not exist) rather than recognizing `finai` as a sibling project in `../finai/`.

### 3. Implementation Deliverables

- **Active Workspace & Sibling Project Discovery**:
  - `apps/gateway/src/services/live-message-history.ts`:
    - Added `getWorkspaceContext()` to dynamically inject the active repository name (`orchestrai`), path, and all discovered sibling repositories (`finai`, `devlab-shared`, etc.) into the system prompt.
    - Explicitly instructed the model that external projects require `../<project>/<file>` or `<project>/<file>` paths and will pause for operator clearance.
- **Smart Sibling Project Candidate Resolution**:
  - `packages/tools/src/security/path-sanitizer.ts` & `apps/gateway/src/services/permission-policy.manager.ts`:
    - When a candidate path does not exist in `workspaceRoot`, checks whether it targets a sibling directory in `path.dirname(workspaceRoot)`.
    - If it matches a sibling project (e.g. `finai/package.json`), resolves it to `../finai/package.json`.
    - Because the path is outside `workspaceRoot`, `checkPermission` marks `allowed: false` and triggers the interactive HITL clearance card (`StudioPermissionCard`).
- **Filesystem Provenance Headers in Tool Execution**:
  - `packages/tools/src/builtins/filesystem/read-file.tool.ts`: Added `resolvedPath` to `ReadFileOutput`.
  - `apps/gateway/src/services/autonomous-agent-runner.ts`: Prepended explicit provenance headers to `read_file` output showing the workspace origin, absolute path, and a note cautioning the model if the file belongs to `orchestrai` while searching for an external project.
- **Modular Grant Storage**:
  - `apps/gateway/src/services/permission-storage.ts`: Extracted `applyGrant()` helper to reduce lines in `permission-policy.manager.ts` (keeping both files < 235 lines).

### 4. Quality Verification

- **Strict TypeScript & ESLint**:
  - `pnpm typecheck` passed with **0 errors across all 37 targets**.
  - `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).
- **250-Line Maximum Rule**:
  - All touched files strictly < 245 lines (`permission-policy.manager.ts`: 232 lines, `autonomous-agent-runner.ts`: 244 lines).

---

## Session: 2026-09-29 — System-Wide AI Agent Data Model & Universal Access Architecture (Phase 14)

### 1. Architectural Scope & Problem Statement

- **Objective**: Design and implement the database model and access control architecture for a universal, system-wide AI agent platform (ChatGPT/Astra style).
- **Invariants Enforced**:
  - Agents are platform/system-level entities (`PlatformScope @default(platform)`), not primarily scoped to a repository, project, or application.
  - Generic Resource Registry with canonical URIs (`file://`, `repo://`, `db://`, `api://`, `service://`, `tenant://`) enabling any current or future resource type without bespoke tables.
  - Capabilities abstraction (`capabilities` & `capability_tools`) grouping concrete execution tools under human-intelligible functional permission domains.
  - Strict User Authority Chain: agents never self-authorize. All unauthorized resource access requests generate persistent `permission_requests` and require explicit operator approval resulting in `access_grants`.
  - Immutable Security Audit Trail: `resource_access_logs` recording every tool invocation, target URI, permission evaluation, and operator clearance decision.
  - Zero `any` types across all packages and services.
  - Hard 250-line rule: all created and refactored files strictly decomposed under 200 lines.

### 2. Core Implementation Deliverables

- **Database Schema Extensions (`packages/database/prisma/schema.prisma`)**:
  - Added enums: `ResourceType`, `PermissionLevel`, `PermissionScopeType`, `RequestStatus`, `GrantStatus`.
  - Added models: `Resource`, `Capability`, `CapabilityTool`, `AgentCapability`, `PermissionRequest`, `AccessGrant`, `ResourceAccessLog`.
  - Updated `Agent`: made `tenantId` optional (`String?`), added `scope PlatformScope @default(platform)`, relations to `capabilities`, `grants`, `requests`, `accessLogs`.
  - Updated `Conversation`: added `userId String? @map("user_id") @db.Uuid` and relations.
  - Added `packages/database/src/seed-capabilities.ts` providing `seedDefaultCapabilities` utility with 6 core capability blueprints.
- **Shared Types & Domain Contracts (`packages/shared-types`, `@orchestrai/core`)**:
  - `packages/shared-types/src/enums/resource.enums.ts`: `ResourceType` enum.
  - `packages/shared-types/src/enums/security.enums.ts`: `PermissionLevel`, `RequestStatus`, `GrantStatus`.
  - `packages/core/src/agents/capability.schema.ts`: `CapabilityDefinitionSchema`, `AgentCapabilityBindingSchema`.
  - `packages/core/src/agents/resource.schema.ts`: `CanonicalUriSchema`, `ResourceDefinitionSchema`, `isResourceContained()`.
  - `packages/core/src/agents/access-grant.schema.ts`: `PermissionRequestSchema`, `AccessGrantSchema`, `ResourceAccessLogSchema`.
  - `packages/core/src/identifiers/id.schema.ts`: Branded IDs `ResourceId`, `CapabilityId`, `GrantId`, `PermissionRequestId`.
- **Gateway Access Control & Services (`apps/gateway`)**:
  - `apps/gateway/src/services/resource-registry.service.ts`: Canonicalizes tool targets into standard URIs and indexes resources.
  - `apps/gateway/src/services/db-grant.service.ts`: Queries active grants, resolves requests, and revokes grants.
  - `apps/gateway/src/services/resource-access-logger.ts`: Asynchronously records immutable audit trails.
  - `apps/gateway/src/services/permission-evaluator.ts`: Extracted pure tool and path checking logic.
  - `apps/gateway/src/services/permission-policy.manager.ts`: Decomposed down to 155 lines.
  - `apps/gateway/src/services/tool-approval-invoker.ts`: Safety gate interceptor and audit logger (97 lines).
  - `apps/gateway/src/services/resource-access.service.ts`: Service for querying resources, grants, requests, and capabilities.
  - `apps/gateway/src/controllers/resource-access.controller.ts`: REST endpoints with zero `any` types.
  - `apps/gateway/src/routes/resource-access.route.ts`: Routes on `/resources`, `/capabilities`, `/grants`, `/approval-requests`.

### 3. Quality Verification & Metrics

- **Strict TypeScript & Zero Any**:
  - `pnpm typecheck` passed with **0 errors across all 37 targets**.
  - Verified zero occurrences of `: any` or `as any` in all modified and new files.
- **ESLint Quality Gate**:
  - `pnpm lint` passed with **0 warnings** (`--max-warnings=0`).
- **File Length Invariant**:
  - All 16 newly created or modified files are strictly < 200 lines (well under the 250-line limit).

### 4. Post-Clearance Execution & Concurrent Session Sync Fixes

- **Atomic Conversation Upsert**:
  - Converted `updateConversation` in `apps/gateway/src/services/conversation.service.ts` to use native atomic `prisma.conversation.upsert()`.
  - Completely eliminated `conversations_pkey` duplicate key violations under concurrent client updates on page load.
- **Post-Clearance Execution Jail Fix**:
  - Fixed `permission-evaluator.ts` and `tool-approval-invoker.ts` to guarantee that single-turn clearances (`once`) and session clearances expand `effectiveRoots` with the cleared project root (`findNearestProjectRoot(resolved)`), directory, and canonical target.
  - Updated `executeWorkspaceTool` in `autonomous-agent-runner.ts` to ensure `roots` always includes `targetRoot` and all cleared roots.
  - Eliminated the issue where `read_file` threw `Access denied: outside authorized directories` immediately after operator granted clearance.

---

### 5. Shared Enum Standardization & Zod Deprecation Modernization

- **Enum Standardization (`PermissionScope`, `ApprovalDecisionVerdict`, `ApprovalRiskLevel`)**:
  - Standardized `PermissionScope` (`ONCE = "once"`, `SESSION = "session"`, `PERMANENT = "permanent"`, `DENY = "deny"`).
  - Standardized `ApprovalDecisionVerdict` (`APPROVED = "approved"`, `REJECTED = "rejected"`, `CANCELLED = "cancelled"`) with lower snake case string values.
  - Replaced raw string literals across switches, conditionals, and defaults with `Enum.Value` references across `apps/gateway`, `apps/console`, `packages/sdk`, `packages/runtime`, `packages/tools`, `packages/core`.
- **Zod 4 Deprecation Modernization**:
  - Eliminated all occurrences of `z.nativeEnum()` in favor of canonical `z.enum(EnumObject)`.
  - Eliminated all occurrences of `z.string().uuid()` across all packages and services in favor of top-level `z.uuid()`.
  - Upgraded `@orchestrai/grpc` and `@orchestrai/eval` dependencies to `"zod": "^4.6.5"`.
- **Strict Invariants Maintained**:
  - All modified files remain strictly below the 250-line maximum rule (Prime Invariant 1).
  - Maintained zero `any` types and zero test cases implemented during phase implementation.

---

### 6. SQL Query Centralization & Canonical Domain Enums

- **Raw SQL Query Centralization**:
  - Extracted raw SQL queries from [`postgres-approval-storage.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/runtime/src/hitl/storage/postgres-approval-storage.ts) into dedicated [`postgres-approval-queries.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/runtime/src/hitl/storage/postgres-approval-queries.ts) (`APPROVAL_SQL_QUERIES`: `CREATE_TICKET`, `GET_TICKET_BY_ID`, `LIST_PENDING`, `RESOLVE_TICKET`, `EXPIRE_STALE_TICKETS`).
  - Extracted raw SQL queries from [`postgres-checkpointer.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/runtime/src/checkpoint/postgres-checkpointer.ts) into dedicated [`postgres-checkpoint-queries.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/runtime/src/checkpoint/postgres-checkpoint-queries.ts) (`CHECKPOINT_SQL_QUERIES`: `UPSERT_CHECKPOINT`, `LOAD_LATEST`, `LOAD_BY_ID`, `LIST_BY_EXECUTION`, `DELETE_AFTER_STEP`, `PRUNE_CHECKPOINTS`).
  - Extracted database ping query `HEALTH_PING_SQL` in [`packages/database/src/health.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/database/src/health.ts).
  - Extracted `TRANSACTION_SQL` (`BEGIN`, `COMMIT`, `ROLLBACK`) across [`packages/database/src/query.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/database/src/query.ts) and [`apps/gateway/src/db/pool.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/apps/gateway/src/db/pool.ts).
- **Loose String Unions Standardized to Canonical Enums**:
  - `CoworkMode`: `CHAT`, `PLAN`, `ACT`, `AUTO`, `AUTONOMOUS`, `RESEARCH`, `PLAN_EXECUTE`, `DIRECT` in [`studio.enums.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/shared-types/src/enums/studio.enums.ts).
  - `StudioEventType`: `THINK`, `PLAN`, `SEARCH`, `WEB`, `FILE`, `DATABASE`, `DELEGATE`, `MODEL`, `TOOL`, `APPROVAL`, `RAG`, `CODE`.
  - `PlanStepStatus`: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`.
  - `ArtifactType`: `DOCUMENT`, `CODE`, `TERMINAL`, `SEARCH`, `DATA`.
  - `ArtifactStatus`: `RUNNING`, `SUCCESS`, `ERROR`.
  - `CoworkMessageRole`: `USER`, `AGENT`, `SYSTEM`.
  - `AgentStatus` & `ExecutionStatus`: Enforced in console types and components (`ExecutionStatus.COMPLETED`, `AgentStatus.IDLE`, etc.).
  - `ModelStatus`: `ONLINE`, `DEGRADED`, `OFFLINE` in `apps/console/src/features/models/types.ts`.
  - Updated all switch statements, conditionals, and default assignments across `apps/console` and `apps/gateway` to reference `Enum.Value`.
- **Compilation & IDE Diagnostic Resolution**:
  - Fixed `permission-evaluator.ts:103` risk level assignment via canonical `ApprovalRiskLevel`.
  - Fixed `permission-policy.manager.ts` value import for `PermissionScope`.
  - Fixed schema imports in `eval-dataset.schema.ts` and `execution-service.ts` to source branded types directly from `@orchestrai/core`.
  - Regenerated package distribution declarations for `@orchestrai/database` and `@orchestrai/queue`.
  - Monorepo typecheck: **37 of 37 targets successful (0 errors)**.
  - Monorepo linter: **0 warnings (`--max-warnings=0`)**.
  - All files strictly adhere to the < 250-line rule (Prime Invariant 1).

---

## Session: 2026-09-29 — Phase 7 Screen Consolidation, Operator Cockpits & Phase 8 Monorepo Hardening

### 1. Phase 7: Screen Consolidation & Operator Cockpits (`apps/console`)

- **Redundant Route Purge**:
  - Configured permanent redirects in `apps/console/next.config.ts` from `/console` to `/`, `/knowledge` to `/context?tab=knowledge`, and `/memory` to `/context?tab=memory`.
  - Replaced legacy `/console/page.tsx` with server-side `redirect("/")`.
- **Upgraded `/executions`**:
  - Implemented `DagVisualizer` (`dag-visualizer.tsx`) with interactive node zoom, latency/token badges, dependency links, and step inspector.
  - Implemented `CheckpointReplayer` (`checkpoint-replayer.tsx`) with timeline scrubber, auto-play stepping, variable snapshot inspector, and "Fork Here" time-travel replay.
  - Mounted in `ExecutionDetailPageContent`.
- **Upgraded `/models`**:
  - Implemented `CostLatencyCockpit` (`cost-latency-cockpit.tsx`) displaying P50/P95/P99 latency percentiles, input/output token rates, monthly spend vs caps, and routing strategies.
  - Mounted dual-tab switcher ("Model Catalog" vs "Cost & Latency Cockpit") in `ModelsPageContent`.
- **Consolidated `/context` Hub**:
  - Created `apps/console/src/app/(dashboard)/context/page.tsx` and `features/context/context-hub-page-content.tsx` seamlessly unifying RAG document indexing and episodic/semantic memory recall.
- **Elevated `/evaluations`**:
  - Built `RubricGradingCard` (`rubric-grading-card.tsx`) with qualitative scoring criteria (Reasoning Fidelity, Tool Compliance, Groundedness, Safety) and instant grading calculations.
- **Global Slide-out HITL Security Clearance Drawer**:
  - Built `ClearanceDrawer` (`clearance-drawer.tsx`) subscribing to `clearance-slice` with blast-radius inspection, keyboard shortcuts (`Cmd+Enter` approve, `Esc` deny), and mounted globally in `DashboardLayout`.

### 2. Phase 8: Monorepo Hardening & Clean Modular Co-location

- **250-Line Maximum Rule Verification**:
  - Audited 100% of `.ts` and `.tsx` files across `apps/*` and `packages/*`.
  - Decomposed `anthropic.adapter.ts` into `anthropic.messages.ts` (193 LOC).
  - Decomposed `postgres-session.repository.ts` into `session-query.runner.ts` (217 LOC).
  - Decomposed `autonomous-agent-runner.ts` into `workspace-tool-executor.ts` (129 LOC).
  - Decomposed `settings-page-content.tsx` into `settings-api-keys-card.tsx` (224 LOC).
  - Every single file across the entire monorepo is now <= 229 LOC (0 files exceed 250 LOC).
- **Strict Feature-First Modular Co-location**:
  - Moved Prisma repositories into their respective domain modules:
    - `modules/session/session.repository.ts`
    - `modules/execution/execution.repository.ts`
    - `modules/agent/agent.repository.ts`
  - Moved cross-cutting messaging adapters into `apps/gateway/src/infra/`.
  - Purged legacy horizontal slice folders `controllers/`, `services/`, and `repositories/`.
- **Quality Gates & Clean DOMA Modular Organization**:
  - Reorganized complex domain modules (`auth/`, `execution/`, `session/`, `agent/`, `platform/`, `permission/`) into clean sub-layers (`controllers/`, `services/`, `repositories/` or `storage/`) exposed through a single public `index.ts` facade.
  - Eliminated all default values and hardcoded fallback arrays:
    - Removed `DEFAULT_NAV_ITEMS` fallback array from `apps/console/src/lib/use-nav.ts`.
    - Purged static `sidebar-nav-items.ts` and `product-nav-items.ts`.
    - Removed `seedIfEmpty` and all hardcoded default menu items from `apps/gateway/src/modules/nav/nav-item.service.ts`.
    - Removed `seedIfEmpty` and all hardcoded default execution modes from `apps/gateway/src/modules/platform/services/platform-mode.service.ts`.
    - Handled empty navigation items state gracefully in `apps/console/src/components/dashboard/sidebar-nav.tsx`.
    - All navigation items and platform entities are now 100% dynamically database-driven.
  - Monorepo typecheck: **43 of 43 targets passing with 0 errors**.
  - Monorepo 250-line rule: **0 files > 250 LOC** (maximum file length is 229 LOC).
  - 100% semantic CSS theme variables used; zero hardcoded strings.

---

## Session: 2026-10-02 — DRY Consolidation, Dedicated `@orchestrai/regex` Package & Automatic Mode and Rule Engine

### 1. Dedicated Zero-Dependency Regex Package (`packages/regex/`)

- **Centralized Pattern Extraction**:
  - Created `@orchestrai/regex` package providing canonical regular expressions and validation helpers across the entire monorepo.
  - Submodules:
    - [`uuid.regex.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/regex/src/uuid.regex.ts): Canonical `UUID_REGEX` supporting versions 1-5 and `isUuid(value)` predicate.
    - [`mode.regex.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/regex/src/mode.regex.ts): Heuristic mode triggers `PLAN_PATTERNS`, `ACT_PATTERNS`, and `CHAT_PATTERNS`.
    - [`security.regex.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/regex/src/security.regex.ts): `SECRET_REDACTION_PATTERNS` (Bearer tokens, API keys, private keys), `CRITICAL_CREDENTIAL_PATTERns`, `SECRET_CONFIG_PATTERNS`.
    - [`network.regex.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/regex/src/network.regex.ts): `BLOCKED_IP_PATTERNS` (SSRF loopback/private range protection), `LOCALHOST_ORIGIN_REGEX`, `IPV4_REGEX`.
    - [`uri.regex.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/regex/src/uri.regex.ts): `CANONICAL_URI_REGEX`, `FILE_PROTOCOL_REGEX`, `POSTGRES_PROTOCOL_REGEX`, `REALTIME_CHANNEL_PREFIX_REGEX`, `TOOL_NAME_REGEX`.
    - [`text.regex.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/regex/src/text.regex.ts): `EMBEDDING_ARRAY_REGEX`, `MARKDOWN_HEADING_REGEX`, `LEADING_TRAILING_DASH_REGEX`, `ALPHANUMERIC_START_REGEX`, `WORD_SPLIT_REGEX`.
- **Consumer Migration**:
  - Replaced ad-hoc and duplicate regex definitions in `@orchestrai/agent`, `@orchestrai/memory`, `@orchestrai/rag`, `@orchestrai/tools`, `apps/gateway`, `apps/realtime`, and `apps/console`.
  - Maintained `@orchestrai/core` zero internal workspace dependency invariant.

### 2. Centralized Platform Rules & Mode Prompts (`packages/prompts/`)

- **Single Source of Truth for Prompts**:
  - Created [`modes.prompt.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/prompts/src/system/modes.prompt.ts) providing canonical `CHAT_MODE_SYSTEM_PROMPT`, `PLAN_MODE_SYSTEM_PROMPT`, `ACT_MODE_SYSTEM_PROMPT`, `AUTO_MODE_SYSTEM_PROMPT`, and `MODE_PROMPT_REGISTRY`.
  - Created [`rules.prompt.ts`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/prompts/src/system/rules.prompt.ts) defining canonical `CORE_PLATFORM_RULES_PROMPT` and `COMPACT_PLATFORM_RULES_PROMPT`.
  - Refactored `ChatModeStrategy`, `PlanModeStrategy`, `ActModeStrategy`, and `AutoModeStrategy` in `@orchestrai/agent` to source prompt definitions directly from `@orchestrai/prompts`.

### 3. Automatic Rule Adoption & Mode Selection Engine

- **Prompt Compiler Rule Injection**:
  - Updated `PromptCompiler` (`packages/agent/src/compiler/prompt-compiler.ts`) to inject `CORE_PLATFORM_RULES_PROMPT` automatically in `<platform_rules>` block unless explicitly disabled (`adoptRules: false`).
- **Autonomous Intent-to-Mode Resolution**:
  - Updated `AgentLoop` (`packages/agent/src/loop/agent-loop.ts`) to initialize default `HeuristicModeRouter`. If mode is `AgentMode.AUTO`, router dynamically resolves whether the prompt is conversational (`CHAT`), analytical planning (`PLAN`), or tool execution (`ACT`) per turn.
  - Updated `apps/gateway` (`live-execution.manager.ts` and `live-message-history.ts`):
    - Added `autoDetectMode(prompt)` to dynamically pick execution mode from user input if not explicitly provided.
    - Updated `buildCompositeSystemPrompt` to inject `CORE_PLATFORM_RULES_PROMPT`, `SAFETY_GUARDRAILS_SYSTEM_PROMPT`, and active mode instructions from `MODE_PROMPT_REGISTRY[mode]`.
- **Python Intelligence Service Alignment**:
  - Implemented `apps/intelligence/src/mode_router.py` with identical regex-based heuristics (`auto_detect_mode`) and canonical system prompts (`PLATFORM_INVARIANTS_PROMPT`, `MODE_PROMPT_REGISTRY`).
  - Wired into `apps/intelligence/src/server.py` to auto-detect mode and adopt platform rules into LangGraph `StateGraph`.

### 4. Architecture Documentation & Markdown Preview Fix

- **System Flow & Architecture Document**:
  - Authored comprehensive `docs/SYSTEM-FLOW-AND-ARCHITECTURE.md` with complete monorepo directory tree, package purpose map, and end-to-end execution flow.
- **Mermaid Preview Compatibility**:
  - Fixed syntax in Mermaid sequence diagrams (un-nested `alt` conditional blocks, quoted participant aliases containing parentheses, removed unescaped angle brackets) ensuring error-free rendering in all Markdown preview engines.

### 5. Quality Invariants & Verification

- **250-Line Rule**: All new files are strictly under 130 LOC; all modified files remain under 200 LOC.
- **Monorepo Typecheck**: 48 of 48 workspace targets passing cleanly (`pnpm typecheck`).
- **Linting & Formatting**: `eslint --max-warnings=0`, `ruff check`, Prettier, and `ruff format` passing with 0 warnings/errors.

---

## Session: 2026-10-02 (Continued) — Workspace Folder Picker, Recent History, @ Mentions & Slash Commands

### 1. Workspace Folder Management Architecture (`apps/console`)

- **Dual-Mode Workspace Selector (`StudioWorkspaceSelector` & `StudioWorkspaceRecentList`)**:
  - Implemented top header dropdown showing active workspace folder name, monospace path badge, and copy button.
  - Native browser directory picker (`window.showDirectoryPicker()`) with fallback path input for arbitrary filesystem paths.
  - Recent workspaces history drawer with active indicator checkmark, single-click workspace switching, and per-workspace deletion.
- **Durable `WorkspaceSlice` with Asynchronous IndexedDB Persistence**:
  - Added `WorkspaceSlice` to `apps/console/src/lib/stores/workspace-slice.ts` persisting `activeWorkspace` and `recentWorkspaces` (up to 15 MRU entries).
  - Wired into `useConsoleStore` with IndexedDB persistence and path normalization.

### 2. Workspace File Exploration API (`apps/gateway`)

- **`WorkspaceFileService` & `WorkspaceController`**:
  - Implemented `apps/gateway/src/modules/workspace/services/workspace-file.service.ts` providing fast directory walking (depth <= 5).
  - Automatically filters out build and dependency directories (`.git`, `node_modules`, `.next`, `dist`, `.turbo`, `.venv`, etc.).
  - Registered `GET /api/v1/workspace/files` endpoint on API router supporting `path`, `query`, and `limit` parameters.
- **Client Query Hook**:
  - Created `apps/console/src/features/studio/api/use-workspace-files.ts` utilizing TanStack Query for high-performance cached autocomplete.

### 3. Interactive Command Station (@ Mentions & / Slash Commands)

- **`@` Mentions Autocomplete (`StudioMentionPopover`)**:
  - Real-time popover triggering on `@` in the command prompt.
  - Searches workspace files and cluster specialist personas with file-type icons and role descriptions.
  - Full keyboard navigation (Arrow Up/Down, Enter, Escape).
  - Automatically switches active specialist when an agent persona is selected.
- **`/` Slash Commands Palette (`StudioSlashCommands`)**:
  - Instant command palette for `/plan`, `/act`, `/chat`, `/auto`, `/clear`, `/compact`, `/files`, and `/help`.
  - Switching mode automatically strips the slash prefix so users can type their prompt immediately.
  - `/clear` triggers `state.handleNewSession()` to clear message feeds and reset canvas cleanly.
- **Canonical Regex Extraction**:
  - Added `prompt.regex.ts` in `@orchestrai/regex` defining `MENTION_QUERY_REGEX`, `SLASH_COMMAND_PREFIX_REGEX`, `TRAILING_PATH_SLASH_REGEX`, and `PATH_SPLIT_REGEX`.
  - Zero inline regular expressions in consumer components.

### 4. Quality Invariants & Verification

- **250-Line Maximum Rule**: All new files decomposed proactively; max LOC is 183 lines (0 files > 221 LOC).
- **Monorepo Typecheck**: 48 of 48 workspace targets passing cleanly (`pnpm typecheck`).
- **Linting & Formatting**: `eslint --max-warnings=0`, `ruff check`, Prettier, and `ruff format` passing with 0 warnings/errors.

---

## Session: 2026-10-03 — UI Shimmer Skeletons, Zero-Hardcoded Copy Catalog & Developer Workbench Normalization

### 1. Accessible UI Skeletons & Layout Shift Elimination (`apps/console`)

- **Root Problem**: Console dashboard pages displayed unstyled raw `"Loading..."` text blocks during TanStack Query resolution, causing cumulative layout shifts (CLS) and degraded visual aesthetics.
- **Solution (`components/ui/skeleton.tsx`)**:
  - Implemented primitive `Skeleton` shimmer block with subtle animation and rounded corners.
  - Implemented composite skeletons matching reference dashboard layouts: `CardGridSkeleton` (for Agents, Models, Tools), `TableSkeleton` (for Executions, Knowledge, Memory, Context), and `DetailPageSkeleton` (for Agent & Execution details).
  - Re-exported via `components/ui/index.ts`.

### 2. Centralized Type-Safe UI Copy Dictionary (`apps/console/src/lib/ui-copy.ts`)

- **Root Problem**: User interface strings (empty state headlines, descriptions, button labels, and modal headers) were hardcoded as bare literals in JSX, violating the zero-hardcoded-strings standard.
- **Solution**:
  - Created centralized dictionary `UI_COPY` (< 200 LOC) standardizing strings across all 8 dashboard domains: `AGENTS`, `EXECUTIONS`, `MODELS`, `KNOWLEDGE`, `MEMORY`, `EVALUATIONS`, `TOOLS`, `CONTEXT`, `STUDIO`, and `COMMON`.
  - Replaced raw text in all page containers, table views, filter empty states, and action buttons.

### 3. Developer Test Workbenches Clarification & Normalization

- **Nature of "Testers"**: Clarified that in-browser testing features (`MemoryRecallDialog`, `KnowledgeQueryDialog`, `ExecutionDebugDialog`, and `EvaluationsDatasetsList`) are **production operator workbenches**, not unit or e2e test cases. They fully comply with the Phase Implementation Testing Policy (which only forbids automated test suite implementation).
- **String Migration**: Migrated all strings within `MemoryRecallDialog` and `KnowledgeQueryDialog` to `UI_COPY.MEMORY.RECALL_TESTER` and `UI_COPY.KNOWLEDGE.QUERY_TESTER`.

### 4. Quality Gates Verification

- **250-Line Rule**: 100% of modified and newly created files remain strictly under 200 lines (e.g. `ui-copy.ts` at 191 LOC, `skeleton.tsx` at 98 LOC).
- **TypeScript Compilation**: `pnpm typecheck` passed cleanly across all 48 Turbo targets with 0 errors.

---

## Session: Enterprise Architecture Character & Brand Transformation (2026-10-03)

### 1. Architectural Re-Positioning & Portfolio Standard

- **Enterprise Platform Mandate**: Elevated OrchestrAI from a "simple local-first project" framing to its true production character: an **enterprise-grade distributed AI agent orchestration platform** engineered to execute complex, massive-scale multi-agent DAGs, distributed queue tasks, and sandboxed tool executions.
- **Air-Gapped Sovereignty as Capability**: Re-framed edge and self-contained execution not as a limiting toy boundary, but as a critical enterprise security feature: **Zero-Trust Security & Air-Gapped Sovereignty** (zero required external cloud egress for complete data sovereignty).

### 2. Comprehensive Brand & Copy Normalization

- **Console UI Copy**:
  - `UI_COPY.COMMON.SIDEBAR.DEFAULT_BRAND_VERSION`: Elevated to `"v1.0.0 • enterprise"`.
  - `UI_COPY.COMMON.A11Y.LOCAL_CORE`: Renamed text to `"Control Plane Runtime"`.
  - `UI_COPY.STUDIO.INSPECTOR.LOCAL_FIRST_STATUS`: Updated to `"Zero-Trust Sandboxed Workspace"`.
  - `UI_COPY.MODELS.PAGE_DESCRIPTION`: Updated to `"High-performance cloud and cluster inference providers configured for this tenant."`.
  - `UI_COPY.MODELS.EMPTY_DESC`: Updated to reflect cloud, cluster, or private inference providers.
- **Branding Hooks & Services**:
  - `use-platform-branding.ts`: Default fallback updated to `"v1.0.0 • enterprise"`.
  - `platform-config.service.ts`: Backend service fallback updated to `"v1.0.0 • enterprise"`.
  - `seed-platform-configs.ts`: PostgreSQL seed data updated to `"v1.0.0 • enterprise"`.
  - `apps/gateway/src/db/local-store.ts`: Elevated JSDoc to reflect embedded zero-dependency storage engine for self-contained runtime environments.
- **Documentation & Agent Directives**:
  - `package.json`: Version bumped to `"1.0.0"` and description elevated to enterprise distributed AI agent orchestration platform.
  - `README.md`: Updated tagline, architecture pillars, tech stack, and prerequisites.
  - `CLAUDE.md`, `AGENTS.md`, and `.agents/AGENTS.md`: Standardized agent instructions around enterprise scale and distributed architecture.
  - `.agents/rules/architecture.md` & `docs/architecture/ARCHITECTURE.md`: Elevated Section 3 to "Air-Gapped Sovereignty & Enterprise Dual-Runtime".

### 3. Verification & Compliance

- **Zero "local-first" string matches**: Verified complete removal across all monorepo source files, markdown docs, and seed configs.
- **Strict Invariants**: All files strictly adhere to the 250 LOC maximum rule.
- **Typecheck & Linting**: Turbo `pnpm typecheck` passed across 48/48 targets with 0 errors; `pnpm lint` passed with 0 warnings.

---

## 2026-10-08: DevLab Multi-Repo Platform Phase 1 — Foundation Extraction & Clean Direct Consumption

### 1. Canonical Foundation Extraction (@yuva-devlab/* in devlab-shared)

- **Extracted Shared Core**:
  - `@yuva-devlab/errors` & `@yuva-devlab/regex`: Universal error hierarchy and centralized regex catalogue.
  - `@yuva-devlab/resilience` & `@yuva-devlab/events`: Circuit breakers, bulkhead, exponential retry with jitter, in-memory bus, transactional outbox, and idempotency stores.
  - `@yuva-devlab/ai-client`: Multi-provider adapters (Groq, Google, Ollama, OpenAI, Anthropic), FallbackCascade, structured output extraction.
  - `@yuva-devlab/agent-core`: UniversalTool, defineTool, ToolRegistry, compilePrompt.
  - `@yuva-devlab/billing`: Dynamic SWR pricing resolver (`IPricingResolver`, `SAFETY_CEILING_PRICING`), token counting, cost ledger, budget enforcer.
  - `@yuva-devlab/semantic-cache`: Cosine similarity caching, LRU eviction, dynamic cache metrics collector.
  - `@yuva-devlab/rag`: Text chunking, token estimation, InMemoryVectorStore, mock embedding provider.
  - `@yuva-devlab/auth-server` & `@yuva-devlab/auth-react`: JWKS RS256 token verification, app kill-switch, multi-tab sync, DevLabAuthProvider.
  - `@yuva-devlab/sdk`: Master DevLabClient integrating AI, RAG, agent tools, billing, semantic caching, and events.

### 2. Clean Architecture Monorepo Refactor (OrchestrAI)

- **Clean Removal of Redundant Packages**:
  - Removed duplicate internal packages: `packages/billing`, `packages/resilience`, `packages/semantic-cache`.
  - Upgraded `apps/gateway` to directly depend on `@yuva-devlab/billing`, `@yuva-devlab/resilience`, and `@yuva-devlab/semantic-cache`.
  - Preserved domain-specific swarm packages (`@orchestrai/events`, `@orchestrai/models`, `@orchestrai/rag`, `@orchestrai/tools`) as first-class citizens.
- **Verification**:
  - `pnpm typecheck` in `orchestrai`: 42/42 tasks passed (FULL TURBO, 0 errors).

### 3. Downstream Consumer Alignment (FinAI)

- **AI Client Delegation**: `@finai/ai-engine` now delegates LLM requests to canonical `@yuva-devlab/ai-client` adapters via `DevLabChatModel`.
- **Universal Tools**: `@finai/api` tool factory exposes `defineUniversalTool` from `@yuva-devlab/agent-core`.
- **Auth Provider**: `@finai/web` layout wrapped with `<DevLabAuthProvider appId="finai">`.
- **Verification**:
  - `pnpm typecheck` in `finai`: 14/14 tasks passed (0 errors).
