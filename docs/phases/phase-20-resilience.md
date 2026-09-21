# Phase 20: `packages/resilience` — Reliability Engineering & Resilience

## Objectives

Establish enterprise-grade reliability engineering primitives and fault-tolerance policies (`@orchestrai/resilience`) across OrchestrAI per Sections 74–79 of `ORCHESTRAI-IMPLEMENTATION.md`:

1. **Deadlines & Bounded Timeouts (`src/deadline/`)**:
   - `withTimeout`: strict temporal bounds on asynchronous operations using `AbortController` and guaranteed timer teardown.
   - `DeadlineContext`: hierarchical deadline propagation passing decaying time budgets from parent orchestrators to subagents, LLMs, and external tools without exceeding parent limits.
   - `TimeoutError`: structured typed error containing operation name, elapsed duration, and timeout limit.

2. **Retry with Exponential Backoff & Jitter (`src/retry/`)**:
   - `retryAsync`: resilient asynchronous execution loop with configurable attempt caps and cancellation signals.
   - Jitter algorithms (`jitter.ts`): full jitter, equal jitter, and decorrelated jitter preventing synchronized thundering herd retry storms.
   - `error-classifier.ts`: intelligent differentiation between transient errors (connection drops, 429, 502, 503, 504) and fatal errors (400, 401, 403, 404, validation errors).

3. **Circuit Breaker State Machine (`src/circuit-breaker/`)**:
   - `CircuitBreaker`: full state machine (`CLOSED -> OPEN -> HALF_OPEN -> CLOSED`).
   - `CircuitBreakerOpenError`: immediate fast-fail exception preventing cascading failures across unhealthy third-party services.
   - Real-time operational telemetry tracking failure counts, rejections, and state transition callbacks.

4. **Bulkhead Concurrency Isolation (`src/bulkhead/`)**:
   - `Bulkhead`: async semaphore isolating capacity across critical boundaries (e.g., max 4 concurrent LLM requests, max 10 web scraping tools, max 20 database queries).
   - Queue bounding with `BulkheadRejectedError` preventing unbounded memory growth.

5. **Fallback & Graceful Degradation (`src/fallback/`)**:
   - `withFallback`: transparent degradation to secondary strategies, smaller LLM models, cached responses, or safe default responses upon primary task failure.

6. **Token Bucket Rate Limiting (`src/ratelimit/`)**:
   - `TokenBucket`: in-memory rate limiter supporting fractional refill pacing and asynchronous token queuing.
   - `RateLimitExceededError`: structured error exposing calculated `retryAfterMs`.

7. **Composable Resilience Pipeline (`src/pipeline/`)**:
   - `ResiliencePipeline` and fluent builder chaining policies in optimal defensive order:
     `Fallback -> RateLimiter -> Retry -> CircuitBreaker -> Bulkhead -> Timeout -> TargetFunction`.

8. **Chaos Testing & Fault Injection (`src/chaos/`)**:
   - `ChaosInjector`: synthetic latency and transient failure injector validating resilience policies without production outages.

9. **Out-of-the-Box Adapters (`src/adapters/`)**:
   - Pre-configured, domain-tailored pipelines for model invocations (`createModelResiliencePipeline`), tool executions (`createToolResiliencePipeline`), and database queries (`createDatabaseResiliencePipeline`).

---

## Directory Structure

```text
packages/resilience/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
└── src/
    ├── deadline/
    │   ├── deadline.types.ts
    │   ├── timeout-error.ts
    │   ├── with-timeout.ts
    │   ├── deadline-context.ts
    │   └── index.ts
    ├── retry/
    │   ├── retry.types.ts
    │   ├── jitter.ts
    │   ├── error-classifier.ts
    │   ├── retry.ts
    │   └── index.ts
    ├── circuit-breaker/
    │   ├── circuit-breaker.types.ts
    │   ├── circuit-breaker-error.ts
    │   ├── circuit-breaker.ts
    │   └── index.ts
    ├── bulkhead/
    │   ├── bulkhead.types.ts
    │   ├── bulkhead-error.ts
    │   ├── bulkhead.ts
    │   └── index.ts
    ├── fallback/
    │   ├── fallback.types.ts
    │   ├── fallback.ts
    │   └── index.ts
    ├── ratelimit/
    │   ├── token-bucket.types.ts
    │   ├── rate-limit-error.ts
    │   ├── token-bucket.ts
    │   └── index.ts
    ├── pipeline/
    │   ├── pipeline.types.ts
    │   ├── resilience-pipeline.ts
    │   └── index.ts
    ├── chaos/
    │   ├── chaos.types.ts
    │   ├── chaos-injector.ts
    │   └── index.ts
    ├── adapters/
    │   ├── model-resilience.ts
    │   ├── tool-resilience.ts
    │   ├── database-resilience.ts
    │   └── index.ts
    └── index.ts
```

---

## Usage Example

```typescript
import {
  ResiliencePipeline,
  createModelResiliencePipeline,
  DeadlineContext,
} from "@orchestrai/resilience";

// 1. Pre-configured LLM resilience pipeline
const modelPipeline = createModelResiliencePipeline({
  modelName: "openai-gpt-4o",
  timeoutMs: 30000,
  maxRetries: 3,
  maxConcurrency: 4,
  fallbackModelHandler: async (error) => {
    return { content: "Fallback response generated from local model" };
  },
});

const result = await modelPipeline.execute(async (signal) => {
  return await callOpenAiApi({ prompt: "Hello world", signal });
});

// 2. Hierarchical deadline propagation
const parentDeadline = DeadlineContext.fromDuration(60000); // 60s total budget

// Child operation constrained by remaining budget or max 5s
const toolDeadline = parentDeadline.createChild(5000);
```

---

## Verification & Quality Gates

- **`pnpm --filter @orchestrai/resilience build`**: Dual ESM/CJS and DTS output compiled cleanly.
- **`pnpm typecheck`**: 27/27 tasks passed across all 19 workspace projects.
- **`pnpm lint`**: Clean pass (`--max-warnings=0`, zero errors, zero warnings).
- **`pnpm build`**: All 18 workspace projects built cleanly.
- **250-Line Rule**: All 36 files strictly between 8 and 189 lines (zero violations).
- **Barrel Imports & Path Aliases**: Used clean barrel exports (`@/deadline`, `@/retry`, `@/pipeline`, etc.) throughout.
