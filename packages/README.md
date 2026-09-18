# Packages

Modular internal packages forming the reusable core of OrchestrAI.

## Package Catalog

| Package                                                                                                              | Purpose                                                                               | Phase    |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- |
| [`@orchestrai/core`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/core)                   | Shared domain contracts, Zod schemas, lifecycle events, interfaces                    | Phase 1  |
| [`@orchestrai/models`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/models)               | Model adapters (Ollama, Anthropic, OpenAI, local) with unified invocation & streaming | Phase 2  |
| [`@orchestrai/tools`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/tools)                 | Tool execution, schema validation, permissions, audit logging, rate limiting          | Phase 3  |
| [`@orchestrai/agent`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/agent)                 | Agent loop, state transitions, prompt assembly, loop guards                           | Phase 4  |
| [`@orchestrai/runtime`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/runtime)             | Stateful orchestration, LangGraph graph execution, checkpointing                      | Phase 5  |
| [`@orchestrai/queue`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/queue)                 | BullMQ job producers, priority scheduling, backpressure control                       | Phase 7  |
| [`@orchestrai/events`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/events)               | Event bus, typed pub/sub, outbox pattern, audit log streaming                         | Phase 9  |
| [`@orchestrai/memory`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/memory)               | Working, episodic, and semantic memory layers with summarization                      | Phase 15 |
| [`@orchestrai/rag`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/rag)                     | Document ingestion, chunking, embeddings, pgvector hybrid search                      | Phase 16 |
| [`@orchestrai/observability`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/observability) | OpenTelemetry tracing, structured JSON logging, Prometheus metrics                    | Phase 19 |
| [`@orchestrai/sdk`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/sdk)                     | Client library for external consumers and developer integration                       | Phase 18 |

## Dependency Rules

1. `@orchestrai/core` has ZERO internal workspace dependencies. It defines shared domain models.
2. Dependencies flow inward: `apps/*` -> `packages/*` -> `packages/core`.
3. Circular dependencies between packages are strictly forbidden.
