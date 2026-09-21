# OrchestrAI — Implementation Progress

> This document tracks the active state of OrchestrAI development across sessions and AI agents.
> **All agents must check and update this document at the start and end of every session.**

---

## Current Status

```text
Current Phase:     Phase 19 — Observability & OpenTelemetry
Current Feature:   OpenTelemetry Tracing, Metrics, and Correlation SDK
Current Status:    [ ] Ready to begin
Overall Progress:  Phases 0-18 Complete (100%), Phase 19 Ready
Last Updated:      2026-09-21
Next Immediate:    Implement OpenTelemetry SDK in packages/observability
```

---

## Master Phase Checklist

| Phase        | Description                            | Status  | Target Package / App            |
| :----------- | :------------------------------------- | :-----: | :------------------------------ |
| **Phase 0**  | **Workspace & Foundation**             | **[x]** | Monorepo root, configs, tooling |
| **Phase 1**  | **Core Contracts & Domain Types**      | **[x]** | `packages/core`                 |
| **Phase 2**  | **Models & LLM Adapters**              | **[x]** | `packages/models`               |
| **Phase 3**  | **Tools & Execution Security**         | **[x]** | `packages/tools`                |
| **Phase 4**  | **Agent Loop & State Transitions**     | **[x]** | `packages/agent`                |
| **Phase 5**  | **Runtime & LangGraph Execution**      | **[x]** | `packages/runtime`              |
| **Phase 6**  | **Database & PostgreSQL Schemas**      | **[x]** | `infrastructure/postgres`       |
| **Phase 7**  | **Queue & BullMQ Producers**           | **[x]** | `packages/queue`                |
| **Phase 8**  | **Worker Application**                 | **[x]** | `apps/worker`                   |
| **Phase 9**  | **Events & Outbox Bus**                | **[x]** | `packages/events`               |
| **Phase 10** | **Persistence & Recovery**             | **[x]** | `packages/runtime`              |
| **Phase 11** | **Human-in-the-Loop (HITL)**           | **[x]** | `packages/runtime`              |
| **Phase 12** | **Realtime Streaming Broker**          | **[x]** | `apps/realtime`                 |
| **Phase 13** | **Console Dashboard UI**               | **[x]** | `apps/console`                  |
| **Phase 14** | **Agent Modes (CHAT/PLAN/ACT/AUTO)**   | **[x]** | `packages/agent`                |
| **Phase 15** | **Memory Systems (Episodic/Semantic)** | **[x]** | `packages/memory`               |
| **Phase 16** | **RAG & Vector Retrieval**             | **[x]** | `packages/rag`                  |
| **Phase 17** | **API Gateway**                        | **[x]** | `apps/gateway`                  |
| **Phase 18** | **Client SDK**                         | **[x]** | `packages/sdk`                  |
| Phase 19     | Observability & OpenTelemetry          |   [ ]   | `packages/observability`        |
| Phase 20     | Reliability Engineering & Resilience   |   [ ]   | `packages/*`                    |
| Phase 21     | Security & Sandboxing                  |   [ ]   | `packages/tools`                |
| Phase 22     | Distributed Consistency                |   [ ]   | `packages/events`               |
| Phase 23     | Advanced PostgreSQL Optimizations      |   [ ]   | `infrastructure/postgres`       |
| Phase 24     | Caching Layer                          |   [ ]   | `packages/runtime`              |
| Phase 25     | Performance & Latency Tuning           |   [ ]   | `apps/*`                        |
| Phase 26     | Evaluation Harness                     |   [ ]   | `packages/eval`                 |
| Phase 27     | Specialized Research Agent             |   [ ]   | `packages/agent`                |
| Phase 28     | Specialized Developer Agent            |   [ ]   | `packages/agent`                |
| Phase 29     | Multi-Agent Orchestration              |   [ ]   | `packages/runtime`              |
| Phase 30     | gRPC Inter-service Layer               |   [ ]   | `apps/*`                        |
| Phase 31     | Kafka Event Streaming                  |   [ ]   | `packages/events`               |
| Phase 32     | Distributed Execution Engine           |   [ ]   | `apps/worker`                   |
| Phase 33     | Production Infrastructure & Docker     |   [ ]   | `infrastructure/docker`         |
| Phase 34     | Kubernetes Helm Deployments            |   [ ]   | `infrastructure/k8s`            |
| Phase 35     | Architecture Review & Audit            |   [ ]   | Whole System                    |

---

## Phase 0 Breakdown

- [x] Monorepo workspace configuration (`pnpm-workspace.yaml`, `package.json`)
- [x] Turborepo task pipeline (`turbo.json`)
- [x] TypeScript base strict configuration (`tsconfig.base.json`, `tsconfig.json`)
- [x] Code formatting & linting configuration (`.prettierrc`, `eslint.config.mjs`)
- [x] Repository directory skeleton (`apps/*`, `packages/*`, `infrastructure/*`, `docs/*`, `scripts/*`)
- [x] AI agent configuration rules (`.agents/AGENTS.md`, `.agents/rules/*`, `.agents/skills/*`, `.github/copilot-instructions.md`)
- [x] GitHub Actions CI workflows & PR templates (`.github/workflows/ci.yml`, `commitlint.yml`, `pull_request_template.md`)
- [x] Core documentation skeleton (`README.md`, `ARCHITECTURE.md`, `ADR-001`, phase guides)
- [x] Base package declarations (`package.json` inside packages/core)
- [x] Install dependencies (`pnpm install`) and verify turbo pipeline runs cleanly
- [x] Phase 0 signoff and handoff to Phase 1 (`packages/core`)

---

## Phase 1 Breakdown

- [x] `@orchestrai/shared-types` package — enums (`AgentMode`, `ExecutionStatus`, `MessageRole`, `ToolPermissionLevel`, `ModelProvider`, `EventType`) and constants
- [x] Branded identifier schemas (UUIDs) via `packages/core/src/identifiers`
- [x] Agent domain: `agent-definition.schema.ts`, `agent-mode.schema.ts`, `agent-state.schema.ts`
- [x] Execution domain: `execution-status.schema.ts` (state machine transitions), `execution-context.schema.ts`, `execution-step.schema.ts`, `approval.schema.ts`
- [x] Message domain: `chat-message.schema.ts`, `content-block.schema.ts`, `message-role.schema.ts`
- [x] Model domain: `model-identifier.schema.ts`, `model-capabilities.schema.ts`, `model-usage.schema.ts`
- [x] Tool domain: `tool-definition.schema.ts`, `tool-call.schema.ts`, `tool-result.schema.ts`
- [x] Event domain: `domain-event.schema.ts`
- [x] Streaming domain: `sse-chunk.schema.ts`, `ws-envelope.schema.ts`
- [x] Error hierarchy: `OrchestrAIError` base + 6 domain error subclasses
- [x] Vitest config with `@/` alias resolution (`vitest.config.ts`)
- [x] Split tsconfig strategy: `tsconfig.json` (full project + tests) / `tsconfig.build.json` (src-only for tsup)
- [ ] Unit tests — deferred to a dedicated test session

---

## Phase 2 Breakdown

- [x] Unified adapter interface (`ILlmAdapter`, `LlmRequest`, `LlmResponse`, `LlmStreamChunk`)
- [x] Ollama adapter (`OllamaAdapter`, `OllamaConfigSchema`, `ollama.mapper.ts` for multimodal images)
- [x] OpenAI adapter (`OpenAiAdapter`, `OpenAiConfigSchema`)
- [x] Anthropic adapter (`AnthropicAdapter`, `AnthropicConfigSchema`)
- [x] Dynamic adapter factory (`createAdapter`) with provider routing and runtime peer-dep validation
- [x] In-memory Model Registry (`ModelRegistry`, capability matrix lookups, fallback resolution)
- [x] Token pricing catalog (`pricing.constants.ts`) and pure usage aggregation (`usage-aggregator.ts`)
- [x] Strict package boundaries & 250-line maximum compliance
- [x] Phase 2 documentation (`docs/phases/phase-02-models.md`)

---

## Phase 3 Breakdown

- [x] Master tool interface (`ITool<TInput, TOutput>`) and execution context (`ToolExecutionContext`)
- [x] Security perimeter: sandbox path jail (`PathSanitizer`) preventing directory traversal attacks
- [x] Hierarchical permission clearance evaluator (`evaluateToolPermission`) with HITL triggers for `DANGEROUS` tools
- [x] Central tool catalog and discovery registry (`ToolRegistry`) with OpenAI, Anthropic, and Ollama schema converters
- [x] Sandboxed runner (`executeTool`) enforcing input Zod validation, timeouts via abort signals, and error containment
- [x] Built-in filesystem tools: `read_file` (windowing), `write_file` (recursive mkdir), `list_directory` (bounded)
- [x] Built-in network tools: `http_fetch` (URL protocol validation, body size caps)
- [x] Built-in system tools: `bash` (classified `DANGEROUS`, subprocess execution, HITL mandatory)
- [x] Zero file line-count violations (all files < 170 lines) with complete JSDoc
- [x] Phase 3 documentation (`docs/phases/phase-03-tools.md`)

---

## Phase 4 Breakdown

- [x] Dynamic state machine controller (`AgentStateMachine`) managing step indices, context vars, and termination guards
- [x] Infinite action repetition loop detector (`LoopDetector`) preventing token drain
- [x] Multi-tier prompt compilation pipeline (`prompt-compiler.ts`) assembling personas, mode instructions, and context
- [x] Pluggable agent mode strategies (`CHAT`, `PLAN`, `ACT`, `AUTO`) via `IModeStrategy` and `resolveModeStrategy`
- [x] Single-step controller (`AgentLoop.step`) and multi-turn runner (`runAgentUntilHalt`)
- [x] Clean Human-In-The-Loop (HITL) suspension when destructive tools are encountered
- [x] Tool-to-message formatting bridge (`createToolResultMessage`, `extractToolCalls`)
- [x] Fluent agent definition builder (`AgentBuilder`)
- [x] Strict package boundaries and 250-line rule adherence across all files
- [x] Phase 4 documentation (`docs/phases/phase-04-agent.md`)

---

## Phase 5 Breakdown

- [x] Directed state graph DAG engine (`StateGraph`, `CompiledGraph`, `START`, `END` sentinels)
- [x] Pluggable state checkpoint persistence interface (`ICheckpointer`) and in-memory engine (`MemoryCheckpointer`)
- [x] Core execution DAG nodes: `ModelNode`, `ToolEvaluatorNode`, `ToolExecutorNode`, `ApprovalGateNode`
- [x] Cyclic multi-turn graph execution with dynamic conditional edge routing
- [x] Clean Human-In-The-Loop (HITL) suspension and resumption from checkpoints
- [x] Master runtime coordinator (`OrchestrAIRuntime`) managing workflow initiation and resumption
- [x] Zero file line-count violations (all files < 180 lines) with complete JSDoc
- [x] Phase 5 documentation (`docs/phases/phase-05-runtime.md`)

---

## Phase 6 Breakdown

- [x] PostgreSQL 16 initialization script (`init/01_extensions.sql`) enabling `uuid-ossp`, `pgcrypto`, and `vector`
- [x] Core relational schema migrations (`migrations/0001_core_entities.sql`, `0002_messages_and_tools.sql`)
- [x] Durable execution DAG checkpoint table (`checkpoints`) with unique `(execution_id, step_index)`
- [x] Transactional Outbox pattern table (`outbox`) solving distributed dual-write inconsistency
- [x] Memory & RAG vector schema (`memory_items`, `documents`, `document_chunks`) with 1536-dim pgvector
- [x] Performance indexing: partial indexes for pending approvals/outbox, GIN on JSONB, HNSW on embeddings
- [x] Prisma ORM schema definition (`prisma/schema.prisma`) and `prisma.config.ts`
- [x] Educational SQL query handbook covering ACID outbox, UPSERT, `FOR UPDATE SKIP LOCKED`, CTE window functions, recursive CTEs, and materialized views with concurrent refresh
- [x] Local Docker Compose configuration (`infrastructure/docker/docker-compose.postgres.yml`)
- [x] Phase 6 documentation (`docs/phases/phase-06-postgres.md`)

---

## Phase 7 Breakdown

- [x] `@orchestrai/queue` package configured with dual ESM/CJS build via `tsup`
- [x] Zod-validated job payload schemas: `AgentExecutionJobPayload`, `ToolExecutionJobPayload`, `DeadLetterJobPayload`
- [x] BullMQ-tuned Redis connection manager (`createRedisConnection`, `closeRedisConnection`) with `maxRetriesPerRequest: null`
- [x] Exponential backoff calculator with Full Jitter (`calculateBackoffWithJitter`) preventing thundering herds
- [x] Queue backpressure controller (`BackpressureController`) evaluating low/high watermarks
- [x] Generic producer contract (`IQueueProducer<TPayload>`) and BullMQ-backed `BaseQueueProducer`
- [x] `AgentExecutionProducer` dispatching execution runs with automatic `idempotencyKey` deduplication
- [x] `ToolExecutionProducer` offloading background tool calls with step deduplication
- [x] `DeadLetterProducer` capturing forensic information for exhausted retry jobs
- [x] Full integration with `OrchestrAIError` hierarchy (`QueueError`, `QueueBackpressureError`, `ValidationError`)
- [x] Zero file line-count violations (all files < 170 lines) with complete JSDoc
- [x] Phase 7 documentation (`docs/phases/phase-07-queue.md`)

---

## Phase 8 Breakdown

- [x] `apps/worker` application configured with build scripts and TS 6 tooling
- [x] Dedicated `@orchestrai/logger` package with colored output, context tags, file persistence, and zero console warnings
- [x] Environment configuration validation with Zod (`WorkerConfigSchema`, `loadWorkerConfig`)
- [x] Job handlers:
  - `agent-job.handler`: Executes `@orchestrai/runtime` DAG execution loop, checkpointing, and output extraction
  - `document-job.handler`: Text extraction and chunking pipeline stub for Phase 16 RAG
  - `evaluation-job.handler`: Offline benchmark and evaluation suite stub for Phase 26
  - `maintenance-job.handler`: DLQ inspection, stale record cleanup, and runtime memory diagnostics
- [x] BullMQ processors:
  - `agent-execution.processor`: Progress reporting (10% -> 100%) and error boundaries
  - `tool-execution.processor`: Detached tool execution with `ToolExecutionContext` and `ToolRegistry`
  - `dead-letter.processor`: Forensic payload capture and operational alerting
- [x] Worker daemons:
  - `BaseWorker`: Lifecycle management, event telemetry (`completed`, `failed`, `stalled`, `error`), pause/resume/close
  - `AgentExecutionWorker`, `ToolExecutionWorker`, `DeadLetterWorker`
  - `WorkerManager`: Multi-worker coordination (`pauseAll`, `resumeAll`, `stopAll`, `getStatuses`)
- [x] DI Service container (`createWorkerContainer`) wiring Redis, ToolRegistry, ModelRegistry, and WorkerManager
- [x] Two-stage graceful shutdown coordinator (`registerProcessLifecycle`) with `SIGTERM`/`SIGINT` traps and in-flight job drain
- [x] Zero file line-count violations (all 23 files < 165 lines) with comprehensive JSDoc
- [x] Removed placeholder `.gitkeep`
- [x] Phase 8 documentation (`docs/phases/phase-08-worker.md`)

---

## Phase 9 Breakdown (Events & Outbox Bus)

- [x] Scaffold `@orchestrai/events` package with `package.json`, `tsconfig.json`, `tsconfig.build.json`, and `tsup.config.ts`
- [x] Domain event payload Zod schemas (`ExecutionCreated`, `ExecutionStarted`, `ExecutionCompleted`, `ExecutionFailed`, `StepStarted`, `StepCompleted`, `ToolCalled`, `ToolCompleted`, `ApprovalRequested`, `ApprovalResolved`)
- [x] Canonical `createDomainEvent` factory helper stamping UUIDs and ISO timestamps
- [x] Interfaces `IEventPublisher`, `IEventSubscriber`, and `IEventBus`
- [x] In-memory asynchronous `MemoryEventBus` with wildcard `*` topics and error containment
- [x] Redis Streams engine:
  - `RedisStreamPublisherConfigSchema` & `RedisStreamConsumerConfigSchema`
  - Hash serializer / deserializer with metadata headers (`eventType`, `eventId`, `executionId`)
  - `RedisStreamPublisher` with `XADD` and approximate trimming (`MAXLEN ~`)
  - `RedisStreamConsumer` worker with consumer groups (`MKSTREAM`), `XREADGROUP`, and `XACK`
- [x] Transactional Outbox subsystem:
  - `IOutboxStorage` contract and `OutboxRecord` with status lifecycle (`PENDING` -> `PROCESSING` -> `PUBLISHED` / `FAILED`)
  - `MemoryOutboxStorage` adapter for local development and testing
  - `OutboxPoller` background engine with interval sweep, batch claiming, and publisher dispatch
- [x] Clean build (`tsup` producing ESM, CJS, and DTS) and typecheck passing across all 19 workspace projects
- [x] Zero file line-count violations (all 16 files < 160 lines) with comprehensive JSDoc
- [x] Phase 9 documentation (`docs/phases/phase-09-events.md`)

---

## Phase 10 Breakdown (Persistence & Recovery)

- [x] Abstract database query runner interface `IDatabaseQueryRunner` and extended `IPersistentCheckpointer`
- [x] Durable PostgreSQL checkpointer `PostgresCheckpointer` with idempotent atomic UPSERTs matching `checkpoints` table (`0003_checkpoints_and_outbox.sql`)
- [x] Checkpoint serialization and hydration subsystem (`packages/runtime/src/checkpoint/serializer/`):
  - `state-serializer.ts`: Type-preserving serialization for `Date`, `Set`, `Map`, `RegExp`, and `Error` / `OrchestrAIError`
  - `state-hasher.ts`: Canonical key-sorted SHA-256 state checksum calculation (`calculateStateHash`, `verifyStateHash`)
- [x] State rewind & time-travel debugging engine (`packages/runtime/src/checkpoint/rewind/`):
  - `rewind-policy.ts`: Policy schemas (`PRUNE_SUBSEQUENT`, `BRANCH_FORK`) and rewind options
  - `state-diff.ts`: Deep object delta comparison (`added`, `modified`, `deleted`) between snapshots
  - `state-rewind-engine.ts`: Execution rollback with downstream pruning or branch forking
- [x] Checkpoint retention & pruning sweeper (`packages/runtime/src/checkpoint/retention/`):
  - `retention-policy.ts`: Retention thresholds with milestone node protection
  - `checkpoint-pruner.ts`: Timeline compaction algorithm preserving critical milestones
- [x] Crash recovery coordinator (`packages/runtime/src/recovery/`):
  - `recovery-types.ts`: Diagnostic inspection contracts and recovery plans
  - `execution-recovery-manager.ts`: Stalled execution detector, checksum verifier, and DAG resumption planner
- [x] Master runtime integration:
  - Added `rewind(executionId, options)` and `recover(executionId, deps)` to `OrchestrAIRuntime`
- [x] Introduced `EXECUTION_ERROR` code to `@orchestrai/shared-types` and `ExecutionError` class to `@orchestrai/core`
- [x] Quality gates passed: `pnpm --filter @orchestrai/runtime build` and full monorepo `pnpm typecheck` (19 of 19 projects clean)
- [x] Strict invariant adherence: 0 test cases added (per user directive) and 100% of files < 217 lines
- [x] Phase 10 documentation (`docs/phases/phase-10-persistence.md`)

---

## Phase 11 Breakdown (Human-in-the-Loop Architecture)

- [x] HITL approval ticket contracts & schemas (`packages/runtime/src/hitl/contracts/`):
  - `RiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and `ApprovalTicket` interface
  - `ApprovalResolutionInputSchema` (`decision: APPROVED | REJECTED | CANCELLED`, `operatorId`, `reason`, `modifiedArguments`)
  - `IApprovalStorage` interface (`createTicket`, `getTicket`, `listPending`, `resolveTicket`, `expireStaleTickets`)
- [x] Storage adapters (`packages/runtime/src/hitl/storage/`):
  - `MemoryApprovalStorage` for development, ephemeral testing, and local runs
  - `PostgresApprovalStorage` targeting relational `approvals` table with optimistic concurrency control (`WHERE approval_id = $6 AND status = 'PENDING'`)
- [x] Policy & risk classification engine (`packages/runtime/src/hitl/policy/`):
  - `ApprovalPolicyConfigSchema` (`defaultTimeoutMs`, `autoApproveClearance`, `alwaysRequireApprovalTools`)
  - `ApprovalPolicyEngine` evaluating mandatory tools, destructive flags, `ToolPermissionLevel.DANGEROUS`, and clearance hierarchy
- [x] Decision engine & watchdog sweeper (`packages/runtime/src/hitl/decision/` & `watchdog/`):
  - `ApprovalDecisionEngine` validating operator verdicts, argument overrides, and cancellation
  - `ApprovalWatchdog` periodic background timer marking stale pending tickets as `TIMED_OUT`
- [x] Runtime engine modularization (`packages/runtime/src/engine/`):
  - Extracted `AgentGraphBuilder` (`agent-graph-builder.ts`, 68 lines) to keep files strictly < 250 lines
  - Extracted `RuntimeApprovalCoordinator` (`runtime-approval-coordinator.ts`, 160 lines) for `resumeApprovalRun`, `cancelApprovalRun`, and `resolveApprovalRun`
  - Modularized `OrchestrAIRuntime` (`orchestrai-runtime.ts`, 193 lines)
  - Integrated `ToolEvaluatorNode` with approval policy evaluation and automatic ticket creation
- [x] Quality gates passed: `pnpm --filter @orchestrai/runtime build` (ESM, CJS, DTS) and full monorepo `pnpm typecheck` (19 of 19 projects clean)
- [x] Phase 11 documentation (`docs/phases/phase-11-hitl.md`)

---

## Phase 12 Breakdown (Real-Time Streaming Broker)

- [x] Scaffold standalone `@orchestrai/realtime` service application with `package.json`, `tsconfig.json`, `tsup.config.ts`, and local `.env.example`
- [x] Environment configuration validation with Zod (`RealtimeConfigSchema`, `loadRealtimeConfig`)
- [x] Channel topics and WS wire protocol types (`executions:{id}`, `agents:{id}`, `presence:{id}`, `system:alerts`)
- [x] Connection & session management:
  - `ClientSession`: Unified session metadata abstraction across WebSocket and SSE connections with heartbeat tracking
  - `ConnectionRegistry`: Map-indexed connection registry supporting lookups by session ID, user ID, channel topic, and backpressure guards
- [x] Redis Pub/Sub integration:
  - `IRedisPubSubBroker` interface defining topic publish, subscribe, unsubscribe, and listener routing
  - `RedisPubSubBroker`: Resilient dual-client Redis Pub/Sub adapter with automatic fallback to in-memory event broker
- [x] Subscription engine (`SubscriptionManager`):
  - Multi-topic subscription tracking per session with topic deduplication and dynamic cleanup on disconnect
- [x] Presence subsystem (`PresenceManager`):
  - Connected operator tracking per execution room with join/leave detection and presence broadcast
- [x] Server-Sent Events (SSE) streaming (`apps/realtime/src/sse/`):
  - `sse-channel.ts`: Line-protocol formatting, keepalive comments (`: keepalive`), and multi-line data framing
  - `sse-handler.ts`: HTTP request handlers for single-execution streams (`/api/v1/stream/executions/:id`) and global event streams (`/api/v1/stream/events`)
- [x] WebSocket gateway subsystem (`apps/realtime/src/websocket/`):
  - `ws-authenticator.ts`: Bearer token extraction and authentication verification
  - `ws-message-handler.ts`: Client payload validation and action dispatching
  - `ws-gateway.ts`: WebSocketServer lifecycle, HTTP upgrade handling on `/ws`, and periodic heartbeat sweeps
- [x] Server coordinator & graceful shutdown (`apps/realtime/src/server/`):
  - `http-router.ts`: Zero-dependency HTTP router handling `/health`, `/metrics`, and SSE streaming routes with CORS headers
  - `realtime-server.ts`: Coordinates HTTP server, WebSocket gateway, Redis Pub/Sub broker, and cross-protocol fan-out
  - `lifecycle.ts`: Two-stage graceful shutdown coordinator trapping `SIGTERM` and `SIGINT` with connection draining
- [x] Application entrypoint (`apps/realtime/src/index.ts`): Environment bootstrapping, server start, and lifecycle registration
- [x] Removed placeholder `.gitkeep` from `apps/realtime`
- [x] Clean build (`tsup` producing ESM, CJS, and DTS) and typecheck passing across all 21 workspace projects
- [x] Zero file line-count violations (all 27 files < 180 lines) with comprehensive JSDoc
- [x] Phase 12 documentation (`docs/phases/phase-12-realtime.md`)

---

## Phase 13 Breakdown (Console Dashboard UI)

- [x] Cross-repository `@yuva-devlab/design-system` integration via local symlinks
- [x] Shared `@yuva-devlab/tokens` with Tailwind 4 `@theme inline` preset and theme variants (`theme-finai.css` Emerald, `theme-orchestrai.css` Terminal Moss)
- [x] 46 production UI components in `@yuva-devlab/ui` with Radix UI, CVA, and Tailwind 4
- [x] Standalone interactive `apps/cookbook` in `design-system` with live FinAI/OrchestrAI theme switching
- [x] Next.js 15 App Router frontend scaffolded in `apps/console` with TypeScript 6 and Tailwind 4
- [x] Google/Meta-grade feature-driven architecture (`src/features/<feature>/...`)
- [x] Thin routing wrappers: all `page.tsx` and `layout.tsx` files strictly 5-15 lines
- [x] Dashboard Shell (`SidebarNav`, `TopBar`, `DashboardShell`)
- [x] Feature modules implemented:
  - `features/console`: Live prompt execution, SSE event stream, agent markdown output card, token telemetry
  - `features/agents`: Agent cards with execution stats, status badges, model tags, and filter tabs
  - `features/executions`: Execution runs table with status icons, duration, and latency metrics
  - `features/workflows`: Visual DAG pipeline builder cards with test run actions
  - `features/tools`: Tool registry catalog with sandbox validation indicators and execution metrics
  - `features/models`: Dynamic LLM fallback cascade cards with 1M token pricing and latency
  - `features/activity`: Real-time diagnostic audit stream for outbox flushes and queue drains
  - `features/settings`: PostgreSQL topology, transactional outbox poller toggle, and security execution limits
- [x] Prime Invariants enforced: 100% of files < 125 lines (zero violations of 250-line rule)
- [x] ESLint `max-lines` (250) and `max-len` (100) rules enforced across monorepo
- [x] Scoped Tailwind linting configured, verified clean across all packages and apps with 0 errors and 0 warnings
- [x] Monorepo-wide typecheck (`pnpm typecheck`) and build (`pnpm build`) passing

---

## Phase 14 Breakdown (Agent Modes: CHAT / PLAN / ACT / AUTO)

- [x] Core Operating Modes and Invariant:
  - `CHAT`: Zero external side-effects; pure conversational dialogue with strict blocking of mutation tools
  - `PLAN`: Read-only exploration and inspection tools allowed (`ToolPermissionLevel.READ_ONLY`), enforcing structured task deconstruction
  - `ACT`: Autonomous tool execution loop with authorized mutations governed by operator clearance tiers and HITL safety gates
  - `AUTO`: Application-controlled routing dynamically selecting the appropriate operational mode
  - Core Invariant: "The LLM proposes behavior; the application enforces permissions and mode constraints." Mode is not a security boundary on its own; authorization remains authoritative
- [x] Structured Planning Engine (`packages/agent/src/modes/plan/`):
  - `plan.schema.ts`: Zod schemas for `PlanStep` (`id`, `title`, `description`, `toolTarget`, `dependencies`, `status`, `verificationCriteria`), `PlanStepStatus`, and `Plan`
  - `plan-parser.ts`: Extracts structured plans from model outputs across Markdown JSON blocks, XML `<plan>` tags, or raw payloads
  - `plan-tracker.ts`: Tracks plan execution state, dependency resolution, step state progression (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`), and overall completion percentage
- [x] Mode Constraint Enforcement (`packages/agent/src/modes/enforcement/`):
  - `mode-constraint.types.ts`: `ModeCheckResult` and `ModeEnforcerOptions`
  - `mode-constraint-enforcer.ts`: Evaluates proposed tool calls before dispatch, guaranteeing that an LLM cannot execute tools forbidden by its active mode
- [x] Application-Controlled Dynamic Mode Routing (`packages/agent/src/modes/routing/`):
  - `mode-router.interface.ts`: `IModeRouter` and `ModeRoutingContext`
  - `heuristic-mode-router.ts`: Fast, zero-latency rule-based classifier evaluating lexical markers, intent verbs, and question styles to route to `CHAT`, `PLAN`, or `ACT`
- [x] Mode Controller & Transition History (`packages/agent/src/modes/controller/`):
  - `mode-controller.ts`: Manages current operational mode, tracks transition audit trail (`ModeTransitionRecord`), and invokes listeners
- [x] Agent Loop & Tool Execution Modularization (`packages/agent/src/loop/`):
  - `step-tool-executor.ts`: Extracted modular tool execution handler enforcing loop detection, mode constraints, HITL gates, and sandbox runs (< 120 lines)
  - `agent-loop.ts`: Integrated mode-filtered tool lists, dynamic AUTO mode routing, plan extraction, and step execution (< 175 lines)
- [x] Clean build (`tsup` producing ESM, CJS, and DTS) and typecheck passing across all 21 workspace projects
- [x] Zero file line-count violations (all 34 files in `packages/agent/src/` < 175 lines) with comprehensive JSDoc
- [x] Phase 14 documentation (`docs/phases/phase-14-modes.md`)

---

## Phase 15 Breakdown (Memory Systems)

- [x] Controlled Memory Principles (Section 59-60):
  - In-monorepo evolutionary architecture: `packages/memory`
  - Explicit categorical classifications: `CONVERSATION`, `WORKING`, `USER_PREFERENCE`, `FACT`, `EPISODIC`, `TASK`, `SYSTEM`
  - Strict governance enforcing relevance, privacy, retention, lifecycle, and retrieval
- [x] Domain Contracts & Schemas (`packages/memory/src/contracts/`):
  - `memory-type.schema.ts`: Zod validation for `MemoryType`
  - `memory-item.schema.ts`: `MemoryItem` Zod schema and `ScoredMemoryItem` interface
  - `memory-query.schema.ts`: `MemoryFilter` and `MemorySearchQuery` schemas
  - `memory-storage.interface.ts`: `IMemoryStorage` contract for persistent and ephemeral backends
- [x] Storage Engines (`packages/memory/src/storage/`):
  - `vector-math.ts`: Pure vector cosine similarity calculations (`calculateCosineSimilarity`)
  - `memory-storage.ts`: Thread-safe, in-memory storage adapter with cosine vector search and TTL pruning
  - `database-runner.interface.ts`: Decoupled `IDatabaseQueryRunner` contract
  - `postgres-memory-storage.ts`: Production PostgreSQL adapter targeting `memory_items` table with pgvector `<=>` cosine distance
- [x] Memory Subsystems (`packages/memory/src/`):
  - `conversation/conversation-window.ts`: Token-aware sliding-window conversation memory buffer
  - `working/working-memory.ts`: Execution-scoped scratchpad for intermediate reasoning and task variables
  - `episodic/`:
    - `episode.types.ts`: `EpisodeRecord` schema
    - `episodic-recorder.ts`: Encodes and records execution runs into episodic narrative memories
  - `semantic/semantic-search.ts`: Multi-factor hybrid relevance re-ranking combining vector similarity, inherent importance score, and half-life recency decay
- [x] Lifecycle, Privacy & Relevance (`packages/memory/src/lifecycle/`):
  - `relevance-filter.ts`: Rejects low-entropy pleasantries ("ok", "thanks") from polluting long-term memory
  - `privacy-sanitizer.ts`: Redacts secrets, tokens, API keys, and sensitive credentials prior to persistence
  - `retention-manager.ts`: Manages TTL per MemoryType and schedules automated sweeps
- [x] Master Facade (`packages/memory/src/manager/`):
  - `memory-manager.ts`: High-level entrypoint orchestrating `remember`, `recall`, `list`, `createWorkingMemory`, `createConversationWindow`, `recordEpisode`, and `pruneExpired`
- [x] Clean build (`tsup` producing ESM, CJS, and DTS) and typecheck passing across all 22 workspace projects
- [x] Zero file line-count violations (all 26 files in `packages/memory/src/` < 195 lines) with comprehensive JSDoc
- [x] Phase 15 documentation (`docs/phases/phase-15-memory.md`)

---

## Phase 16 Breakdown (RAG & Vector Retrieval Pipeline)

- [x] Scaffold `@orchestrai/rag` package with `package.json`, `tsconfig.json`, `tsconfig.build.json`, and `tsup.config.ts`
- [x] Evolutionary architecture: In-monorepo TypeScript package first with clean evolution path to Python microservice (`apps/rag`)
- [x] Domain contracts & Zod schemas (`packages/rag/src/contracts/`):
  - `document.schema.ts`: `Document` and `CreateDocumentInput` schemas
  - `chunk.schema.ts`: `DocumentChunk`, `CreateChunkInput`, and `ScoredDocumentChunk`
  - `rag-query.schema.ts`: `RagFilter`, `RagSearchQuery`, `VectorSearchOptions`, `KeywordSearchOptions`, `HybridSearchOptions`
  - `rag-storage.interface.ts`: `IRagStorage` persistence abstraction
- [x] Ingestion & text extraction subsystem (`packages/rag/src/ingestion/`):
  - `extractor.interface.ts`: `ITextExtractor` and `ExtractedDocument` contracts
  - `text-extractor.ts`: Plain text, markdown, csv, and delimited text extraction with heading-based title inference
  - `json-extractor.ts`: Structured JSON document extraction with attribute flattening
  - `document-ingestor.ts`: Multi-format ingestion coordinator with fallback
- [x] Text chunking & token budgeting subsystem (`packages/rag/src/chunking/`):
  - `chunker.interface.ts`: `ITextChunker`, `ChunkOptions`, and `TextChunkResult`
  - `token-estimator.ts`: Fast zero-dependency token count estimator
  - `text-chunker.ts`: Boundary-aware sliding-window chunker with sentence/paragraph splitting and configurable token overlap
- [x] Embedding provider subsystem (`packages/rag/src/embeddings/`):
  - `embedding-provider.interface.ts`: `IEmbeddingProvider` contract
  - `mock-embedding-provider.ts`: Deterministic, unit-normalized 1536-dimensional embedding provider for reproducible testing and offline runs
  - `ollama-embedding-provider.ts`: HTTP client connecting to Ollama instances (`/api/embed` and `/api/embeddings`) with timeout and error handling
- [x] Storage engines & adapters (`packages/rag/src/storage/`):
  - `vector-math.ts`: Pure vector cosine similarity calculations
  - `database-runner.interface.ts`: Decoupled `IDatabaseQueryRunner` contract
  - `memory-matchers.ts`: In-memory tenancy filtering and term density scorers
  - `memory-rag-storage.ts`: Thread-safe in-memory vector & lexical storage adapter
  - `postgres-row-mappers.ts`: Type-safe row mapping functions for database rows
  - `postgres-rag-storage.ts`: PostgreSQL storage adapter targeting `documents` and `document_chunks` with pgvector `<=>` cosine distance
- [x] Hybrid retrieval & reranking (`packages/rag/src/retrieval/` & `reranking/`):
  - `hybrid-retriever.ts`: Reciprocal Rank Fusion (RRF, k=60) and linear score fusion combining dense vectors and sparse keywords
  - `relevance-reranker.ts`: Multi-factor relevance reranking combining semantic similarity, lexical density, and document diversity penalties
- [x] Context construction & citations (`packages/rag/src/context/`):
  - `context-builder.types.ts`: `ContextCitation`, `ContextBuildOptions`, `FormattedContext`
  - `context-builder.ts`: Assembles ranked chunks into prompt-ready markdown context strings with structured citations (`[1] Source: ...`) and token budget enforcement
- [x] Master Facade (`packages/rag/src/pipeline/`):
  - `rag-pipeline.ts`: End-to-end facade orchestrating `ingest`, `query`, and document lifecycle
- [x] Added `RAG_ERROR` to `ErrorCode` in `@orchestrai/shared-types` and `RagError` to `@orchestrai/core`
- [x] Clean build (`tsup` producing ESM, CJS, and DTS) and typecheck passing across all 23 workspace projects
- [x] Zero file line-count violations (all 29 files in `packages/rag/src/` < 180 lines) with comprehensive JSDoc
- [x] Phase 16 documentation (`docs/phases/phase-16-rag.md`)

---

## Phase 17 Breakdown (Public API Gateway)

- [x] Scaffold `apps/gateway` with `package.json`, `tsconfig.json`, `tsup.config.ts`, `.env.example`
- [x] Clean layered architecture: `Routes -> Controllers -> Services` adhering to enterprise AI company standards
- [x] Configuration & request context (`apps/gateway/src/config/` & `context/`):
  - `gateway-config.schema.ts`: Zod schema validating port, host, security keys, rate limits, and shutdown timeouts
  - `gateway-config.ts`: Environment variable parsing and defaults loader
  - `request-context.ts`: Tenancy isolation (`x-tenant-id`), correlation trace ID (`x-request-id`), remote IP, and user identity extraction
- [x] Security & policy middleware (`apps/gateway/src/middleware/`):
  - `cors.middleware.ts`: CORS headers and preflight 204 response
  - `auth.middleware.ts`: API key (`X-API-Key`) and Bearer token (`Authorization`) guard with 401 error response
  - `rate-limiter.ts`: In-memory sliding-window rate limiter with RFC headers (`X-RateLimit-*`, `Retry-After`)
  - `error.middleware.ts`: Global error handler mapping Zod, OrchestrAI domain errors, and JSON syntax errors
- [x] Validation schemas & DTOs (`apps/gateway/src/validation/`):
  - `execution.schema.ts`: `CreateExecutionDto`, `ExecutionFilterDto`, `ResumeExecutionDto`
  - `conversation.schema.ts`: `CreateConversationDto`, `AddMessageDto`, `MessageQueryDto`
  - `agent.schema.ts`: `CreateAgentDto`, `UpdateAgentDto`, `AgentFilterDto`
  - `rag.schema.ts`: `IngestDocumentDto`, `QueryRagDto`
  - `approval.schema.ts`: `ResolveApprovalDto`, `ApprovalFilterDto`
- [x] Domain services layer (`apps/gateway/src/services/`):
  - `execution.service.ts`: Execution dispatch, query, cancel, and resume operations
  - `conversation.service.ts`: Multi-turn session creation and message appending
  - `agent.service.ts`: Agent definition registration, query, and update operations
  - `rag.service.ts`: Document ingestion and vector query orchestration
  - `approval.service.ts`: Human-in-the-loop approval listing and resolution
- [x] HTTP controllers layer (`apps/gateway/src/controllers/`):
  - `health.controller.ts`: Liveness (`/health`) and readiness (`/ready`) probes
  - `execution.controller.ts`: Execution REST HTTP request handling
  - `conversation.controller.ts`: Conversation and messaging HTTP request handling
  - `agent.controller.ts`: Agent management HTTP request handling
  - `rag.controller.ts`: RAG ingestion and retrieval HTTP request handling
  - `approval.controller.ts`: Approval ticket resolution HTTP request handling
- [x] Routing & server orchestration (`apps/gateway/src/routes/` & `server/`):
  - `router.ts`: Lightweight parameterized route dispatcher with URL parameter parsing (`:id`) and JSON streaming body reader
  - `gateway-server.ts`: HTTP server orchestrating CORS -> Context -> Auth -> RateLimit -> Router pipeline
  - `lifecycle.ts`: Graceful shutdown draining in-flight requests on SIGTERM/SIGINT
- [x] Central barrel files and `@/*` path aliases across all gateway modules
- [x] Monorepo quality gates: `pnpm --filter @orchestrai/gateway build`, `pnpm typecheck`, `pnpm lint` (`--max-warnings=0`), and `pnpm build` passing with zero errors
- [x] Zero file line-count violations (all 43 files in `apps/gateway/src/` < 120 lines) with comprehensive JSDoc
- [x] Phase 17 documentation (`docs/phases/phase-17-gateway.md`)

---

## Phase 18 Breakdown (Client SDK with AI Cost Protection & HMAC Signing)

- [x] Scaffold `packages/sdk` with `package.json`, `tsconfig.json`, `tsconfig.build.json`, `tsup.config.ts`
- [x] Enterprise security & HMAC request signing (`packages/sdk/src/security/`):
  - `nonce-generator.ts`: Cryptographically secure UUIDv4 nonces for replay attack prevention
  - `hmac-signer.ts`: Web Crypto HMAC-SHA256 signature generator over `(METHOD, PATH, TIMESTAMP, NONCE, CONTENT_HASH)`
  - `credential-sanitizer.ts`: Masking of tokens, API keys, and client secrets in logs and errors
- [x] Strongly-typed error hierarchy (`packages/sdk/src/errors/`):
  - `sdk-error.ts`: Base `OrchestrAISDKError` with request ID and status code
  - `http-errors.ts`: `AuthenticationError`, `PermissionDeniedError`, `NotFoundError`, `RateLimitError`, `ValidationError`, `BudgetExceededError`, `GatewayTimeoutError`
- [x] Resilient HTTP transport & cost protection (`packages/sdk/src/transport/`):
  - `retry-policy.ts`: Exponential backoff with full jitter and `Retry-After` header support
  - `idempotency.ts`: Automatic idempotency key generation guarding against duplicate execution charges
  - `error-mapper.ts`: Maps HTTP response bodies and status codes to typed SDK errors
  - `http-client.ts`: Resilient Web `fetch` client managing HMAC signing, headers, timeouts, and streaming
- [x] Streaming subsystem (`packages/sdk/src/streaming/`):
  - `sse-parser.ts`: Zero-dependency Server-Sent Events stream decoder
  - `stream-iterator.ts`: `AsyncIterableIterator<StreamEvent>` for native `for await (const event of ...)`
- [x] Fluent domain resources (`packages/sdk/src/resources/`):
  - `resource-base.ts`: Abstract base class providing transport access
  - `agents.ts`: `AgentsResource` (`list`, `get`, `create`, `update`, `run`)
  - `executions.ts`: `ExecutionsResource` (`get`, `list`, `cancel`, `resume`, `stream`)
  - `execution-handle.ts`: `ExecutionHandle` fluent controller (`.stream()`, `.wait()`, `.cancel()`, `.resume()`)
  - `conversations.ts`: `ConversationsResource` (`create`, `getMessages`, `sendMessage`)
  - `rag.ts`: `RagResource` (`ingest`, `query`)
  - `approvals.ts`: `ApprovalsResource` (`list`, `resolve`)
- [x] Master Client and factory (`packages/sdk/src/client.ts` & `src/index.ts`):
  - `OrchestrAIClient`: Top-level client with sub-resource properties
  - `createOrchestrAIClient`: Factory helper
- [x] Monorepo quality gates: `pnpm --filter @orchestrai/sdk build` (Dual ESM & CJS with full DTS), `pnpm typecheck`, `pnpm lint` (`--max-warnings=0`), and `pnpm build` all passing
- [x] Zero file line-count violations (all 29 files in `packages/sdk/src/` < 175 lines) with comprehensive JSDoc
- [x] Phase 18 documentation (`docs/phases/phase-18-sdk.md`)
