# Phase 8: `apps/worker` — Worker Application

## Objectives

Establish the standalone background task execution engine (`apps/worker`) for OrchestrAI, providing:

1. **Decoupled Asynchronous Processing**: Separates long-running agent reasoning graphs and tool execution from HTTP ingress servers (`apps/gateway`).
2. **BullMQ Consumer Workers**:
   - `AgentExecutionWorker`: Consumes `orchestrai-agent-execution` queue with concurrency controls, dispatching state graphs via `@orchestrai/runtime`.
   - `ToolExecutionWorker`: Consumes `orchestrai-tool-execution` queue for detached background tool tasks.
   - `DeadLetterWorker`: Consumes `orchestrai-dead-letter` queue for operator forensic inspection.
3. **Structured Job Handlers (`src/jobs/`)**:
   - `agent/`: Orchestrates the `@orchestrai/runtime` DAG execution loop, checkpointing, and output extraction.
   - `document/`: Ingestion, parsing, and chunking stub prepared for Phase 16 RAG.
   - `evaluation/`: Offline agent evaluation and benchmark suite stub for Phase 26.
   - `maintenance/`: Dead-letter queue analysis, stale data purging, and memory diagnostics.
4. **Resilient Lifecycle & Graceful Drain (`src/bootstrap/`)**:
   - `WorkerConfigSchema`: Zod validation for Redis credentials, concurrency limits, and timeouts.
   - `createWorkerContainer`: Dependency injection wiring Redis connections, ToolRegistry, ModelRegistry, and worker managers.
   - `registerProcessLifecycle`: Captures `SIGTERM` and `SIGINT`, pauses workers to halt ingestion of new jobs, drains in-flight active jobs, and safely closes Redis connections.
5. **Dedicated Logging Package (`@orchestrai/logger`)**:
   - Extracted standalone logger modeled on FinAI with ANSI coloring, context tags, file persistence, and stream-direct output (`process.stdout`/`process.stderr`) eliminating ESLint `no-console` warnings.
6. **Architectural Invariants**:
   - Strict 250-line rule per file across all modules (all files < 160 lines).
   - Domain errors powered by `OrchestrAIError` (`WorkerError`, `ValidationError`, `ToolExecutionError`).
   - Strict TypeScript with zero `any` types.

---

## Application Location

`apps/worker/`

---

## Monorepo Layer Hierarchy

1. Sits in the **Applications Layer** (`apps/*`).
2. Depends inward on `@orchestrai/core`, `@orchestrai/shared-types`, `@orchestrai/models`, `@orchestrai/tools`, `@orchestrai/agent`, `@orchestrai/runtime`, and `@orchestrai/queue`.
3. No package in `packages/*` ever depends on `apps/worker`, preserving clean unidirectional dependency flow.

---

## Directory Structure

```text
apps/worker/
├── src/
│   ├── bootstrap/
│   │   ├── config.ts                    # Zod-validated environment config
│   │   ├── container.ts                 # Service container & worker wiring
│   │   ├── lifecycle.ts                 # Graceful drain & signal handler
│   │   └── index.ts
│   ├── jobs/
│   │   ├── agent/
│   │   │   ├── agent-job.handler.ts     # DAG execution handler
│   │   │   └── index.ts
│   │   ├── document/
│   │   │   ├── document-job.handler.ts  # Document ingestion stub (RAG)
│   │   │   └── index.ts
│   │   ├── evaluation/
│   │   │   ├── evaluation-job.handler.ts# Offline benchmark stub
│   │   │   └── index.ts
│   │   ├── maintenance/
│   │   │   ├── maintenance-job.handler.ts # DLQ inspection & cleanup
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── processors/
│   │   ├── agent-execution.processor.ts # BullMQ processor with progress reporting
│   │   ├── tool-execution.processor.ts  # BullMQ processor for detached tools
│   │   ├── dead-letter.processor.ts     # BullMQ processor for DLQ inspection
│   │   └── index.ts
│   ├── workers/
│   │   ├── base.worker.ts               # Abstract BaseWorker with lifecycle & events
│   │   ├── agent-execution.worker.ts    # Dedicated agent worker
│   │   ├── tool-execution.worker.ts     # Dedicated tool worker
│   │   ├── dead-letter.worker.ts        # Dedicated DLQ worker
│   │   ├── worker-manager.ts            # High-level coordinator (start/pause/stop all)
│   │   └── index.ts
│   └── index.ts                         # Worker daemon executable entrypoint
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── tsup.config.ts
```

---

## Reliability & Fault Tolerance

1. **Two-Stage Graceful Shutdown**:
   - Stage 1: When `SIGTERM` or `SIGINT` is received, `WorkerManager.pauseAll()` immediately pauses all BullMQ workers. This halts polling so no new jobs are accepted from Redis.
   - Stage 2: In-flight active jobs continue processing. `WorkerManager.stopAll()` awaits their completion up to `GRACEFUL_SHUTDOWN_TIMEOUT_MS` (default: 15 seconds) before closing Redis connections and exiting.
2. **Forensic Dead-Letter Alerting**:
   - Jobs exceeding retry limits on `orchestrai-agent-execution` or `orchestrai-tool-execution` are routed to the DLQ.
   - `DeadLetterWorker` processes and logs forensic failure payloads for observability and manual remediation.
