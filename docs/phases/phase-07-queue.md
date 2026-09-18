# Phase 7: `packages/queue` — Queue & BullMQ Producers

## Objectives

Establish the asynchronous job dispatching, priority scheduling, and queue reliability architecture for OrchestrAI, providing:

1. Strongly-typed job payload schemas (`AgentExecutionJobPayload`, `ToolExecutionJobPayload`, `DeadLetterJobPayload`) with Zod runtime validation.
2. A shared Redis connection factory configured specifically for BullMQ blocking commands (`maxRetriesPerRequest: null`).
3. An abstract `BaseQueueProducer<TPayload>` managing BullMQ `Queue` instances, bulk enqueueing, metrics retrieval, and connection cleanup.
4. Specialized producers:
   - `AgentExecutionProducer`: Dispatches agent workflow runs to `orchestrai:agent-execution` with automatic `idempotencyKey` deduplication.
   - `ToolExecutionProducer`: Offloads long-running or external tool calls to `orchestrai:tool-execution` with `${executionId}:${stepId}` deduplication.
   - `DeadLetterProducer`: Captures exhausted, poisoned, or failed jobs in `orchestrai:dead-letter` for forensic analysis.
5. Reliability & resilience mechanics:
   - **Exponential Backoff with Full Jitter**: Mathematical formula preventing thundering herds during service recovery.
   - **Backpressure Controller**: Watermark monitoring (low/high) preventing worker cluster memory saturation.
6. Unified error handling powered by `OrchestrAIError`:
   - `ValidationError` (HTTP 400) for payload schema rejections.
   - `QueueBackpressureError` (HTTP 503) for saturated queue assertions.
   - `QueueError` (HTTP 500) wrapping BullMQ and Redis connection/dispatching failures.
7. Zero file line-count violations (all files < 170 lines) with complete JSDoc.

---

## Package Location

`packages/queue/`

---

## Invariant Rules & Monorepo Layer Hierarchy

1. Sits in the **Domain / Integration Layer**.
2. Depends inward on `@orchestrai/core` and `@orchestrai/shared-types`.
3. Does **not** import worker execution code (`apps/worker`), maintaining clean one-way producer -> queue -> consumer boundaries.
4. Strictly adheres to the **250-line rule** per file.

---

## Modules Implemented

```text
packages/queue/src/
├── types/
│   ├── job.types.ts                 # AgentExecution, ToolExecution, DeadLetter schemas & JobPriority
│   ├── queue.types.ts               # RedisConnectionConfig, EnqueueJobOptions, QueueMetrics
│   └── index.ts
├── connection/
│   ├── redis-connection.ts          # ioredis client factory & disconnect handler
│   └── index.ts
├── resilience/
│   ├── backoff-strategy.ts          # Exponential backoff with full jitter calculation
│   ├── backpressure-controller.ts   # Watermark monitoring (HEALTHY, THROTTLED, SATURATED)
│   └── index.ts
├── producer/
│   ├── queue-producer.interface.ts  # IQueueProducer<TPayload> contract
│   ├── base-producer.ts             # BaseQueueProducer with BullMQ Queue instance
│   ├── agent-execution.producer.ts  # AgentExecutionProducer with idempotency deduplication
│   ├── tool-execution.producer.ts   # ToolExecutionProducer for background tool calls
│   ├── dead-letter.producer.ts      # DeadLetterProducer for forensic routing
│   └── index.ts
└── index.ts                         # Master barrel export
```

---

## Core Engineering Principles & Architectural Mechanics

### 1. Asynchronous Offloading & Worker Decoupling

In conversational and agentic AI, reasoning loops may span seconds or minutes (multi-step tool calls, LLM generation). Performing this work synchronously inside HTTP request threads leads to socket timeouts, connection pool exhaustion, and poor user experience.
The API Gateway accepts requests, stores the initial execution record in PostgreSQL, enqueues an `AgentExecutionJobPayload` via BullMQ, and immediately returns `HTTP 202 Accepted` with the `executionId`.

### 2. Idempotency & Deduplication

Network retries can submit identical HTTP execution requests. To prevent running redundant multi-turn agent loops:

- `AgentExecutionProducer` binds the BullMQ `jobId` to the client-supplied `idempotencyKey`.
- If a job with that ID already exists in Redis, BullMQ discards the duplicate request without side effects.

### 3. Full Jitter Exponential Backoff

When transient network partitions or upstream provider rate limits occur, retrying on a fixed schedule results in synchronized retry spikes (thundering herd problem).
The `calculateBackoffWithJitter` algorithm uses:
$$\text{ceiling} = \min(\text{maxDelay}, \text{baseDelay} \times \text{factor}^{\text{attempt}})$$
$$\text{delay} = \text{random}(0, \text{ceiling})$$
This distributes retries uniformly across time, maximizing recovery probability.

### 4. Backpressure Sensing

The `BackpressureController` assesses queue backlog (`waiting + delayed` jobs):

- **Healthy**: Backlog < Low Watermark. Process normally.
- **Throttled**: Low Watermark $\le$ Backlog < High Watermark. Accept jobs but apply recommended throttling delay.
- **Saturated**: Backlog $\ge$ High Watermark. Reject incoming non-critical tasks to prevent worker memory exhaustion.

---

## Verification & Build Validation

- Build output: Dual ESM/CJS bundles and declaration files generated via `tsup`.
- Monorepo typecheck: `pnpm typecheck` passed with 12/12 successful tasks.
- Zero line-count violations: All files in `packages/queue` are under 150 lines of code.
