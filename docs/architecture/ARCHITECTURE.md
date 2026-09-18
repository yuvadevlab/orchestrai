# OrchestrAI System Architecture

## 1. System Overview

OrchestrAI is an enterprise-grade, local-first platform for autonomous and human-in-the-loop AI agent orchestration. It bridges the gap between simple prompt wrappers and resilient, distributed execution engines.

The platform is designed around six core pillars:

1. **Stateful Graph Execution**: Agents operate as state machines with checkpointed transitions, rewindability, and branching.
2. **Local-First Foundations**: Complete system functions offline using PostgreSQL + pgvector, Redis, and local Ollama models.
3. **Strict Contract Boundaries**: Domain schemas and types in `@orchestrai/core` enforce invariant correctness across services.
4. **Resilient Background Processing**: Long-running operations, tool executions, and subagent runs are processed asynchronously with backpressure.
5. **Human-in-the-Loop Safeguards**: High-risk tool calls (filesystem, network, database writes) trigger interactive pauses awaiting operator clearance.
6. **Realtime Observability**: Event-driven streaming rails expose granular token, step, tool, and runner lifecycles to the operator console.

---

## 2. Core Subsystems

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (apps/gateway)                     │
│  - REST & WebSocket Ingress                                                 │
│  - JWT & API Key Authentication                                             │
│  - Request Validation & Rate Limiting                                       │
└───────────────┬─────────────────────────────────────────────┬───────────────┘
                │                                             │
                ▼                                             ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────────┐
│     Realtime Streamer (apps/realtime) │   │     Worker Engine (apps/worker) │
│  - SSE Execution Rail Stream          │   │  - BullMQ Job Processor         │
│  - WebSocket Subscriptions            │   │  - Step Execution & Checkpoints │
│  - Pub/Sub Event Forwarding           │   │  - Subagent Runner Pool         │
└───────────────────────────────────────┘   └─────────────────────────────────┘
                │                                             │
                └───────────────────────┬─────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Domain Logic Packages                             │
│                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │    @orchestrai/agent    │  │   @orchestrai/runtime   │                   │
│  │  - Agent Loop & State   │  │  - LangGraph Execution  │                   │
│  │  - Modes (CHAT/PLAN/ACT)│  │  - Checkpoints & Rewind │                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │    @orchestrai/tools    │  │   @orchestrai/models    │                   │
│  │  - Tool Registry & Exec │  │  - Model Provider Adapters│                 │
│  │  - Permissions & Sandbox│  │  - Streaming & Tokenizers│                  │
│  └─────────────────────────┘  └─────────────────────────┘                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │    @orchestrai/memory   │  │    @orchestrai/rag      │                   │
│  │  - Short & Episodic Mem │  │  - Embeddings Pipeline  │                   │
│  │  - Conversation Window  │  │  - pgvector Similarity  │                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                   │
│  │    @orchestrai/events   │  │    @orchestrai/queue    │                   │
│  │  - Outbox Pattern Bus   │  │  - BullMQ Producers     │                   │
│  │  - Typed Domain Events  │  │  - Priority Scheduling  │                   │
│  └─────────────────────────┘  └─────────────────────────┘                   │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       @orchestrai/core (Shared Contracts)                   │
│  - Execution Context, Agent State, Message Types, Tool Schemas, Error Enums │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow & Execution Lifecycle

```text
1. USER/CLIENT REQUEST
   └─▶ Gateway receives HTTP POST /api/v1/agents/:id/execute
   └─▶ Validates payload via Zod schema from @orchestrai/core
   └─▶ Creates Execution Record in PostgreSQL (Status: PENDING)
   └─▶ Enqueues BullMQ Job to Redis (queue: agent-execution)
   └─▶ Returns HTTP 202 Accepted with executionId and SSE stream URL

2. STREAM CONNECTION
   └─▶ Client connects to Realtime Gateway via SSE: /api/v1/executions/:id/stream
   └─▶ Realtime service subscribes to Redis channel `execution:${executionId}`

3. WORKER EXECUTION
   └─▶ Worker picks up job from BullMQ
   └─▶ Hydrates Agent State from PostgreSQL checkpoint
   └─▶ Publishes lifecycle event: `execution:started`
   └─▶ Invokes LangGraph Runtime:
       ├─ Node 1: Model Invocation (@orchestrai/models)
       ├─ Node 2: Tool Evaluation & Permission Check (@orchestrai/tools)
       │          └─ If HITL required: Checkpoint state, emit `approval_required`, wait
       ├─ Node 3: Tool Execution & Result Capture
       └─ Node 4: State Transition & Memory Update (@orchestrai/memory)
   └─▶ Persists final state checkpoint in PostgreSQL
   └─▶ Emits `execution:completed` to Redis pub/sub
```

---

## 4. Resilience & Operational Invariants

- **Idempotency**: All execution tasks carry a unique `idempotencyKey` to prevent double-execution during worker failover.
- **Transactional Outbox**: Events destined for message queues/brokers are written to an `outbox` table in PostgreSQL within the same transaction as state updates, eliminating dual-write inconsistencies.
- **Circuit Breakers**: External LLM and tool calls are protected by timeouts and circuit breakers to prevent cascade failures.
- **Audit Logs**: Every executed tool call records: executing agent, tool name, input arguments, execution duration, output summary, and approving operator (if HITL).
