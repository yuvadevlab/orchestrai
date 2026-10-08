# OrchestrAI — Master Product Specification, Technical Dossier & Operations Manual

---

## 1. Product File: Strategic Vision & Market Requirements

### 1.1 Executive Product Summary

**OrchestrAI** is an enterprise-grade distributed AI agent orchestration platform engineered to execute long-running, multi-step cognitive workflows through autonomous multi-agent swarms, durable state machines, capability-sandboxed tool harnesses, and multi-tier memory systems.

Unlike simplistic conversational LLM wrappers or script-based agent chains, OrchestrAI is built on distributed systems primitives:

- **Resilient State Graphs**: Long-running workflows are modeled as cyclic or acyclic directed graphs where every transition, agent observation, and intermediate result is durably snapshotted to a transactional store.
- **Role-Specialized Agent Swarms**: Monolithic tasks are automatically decomposed into discrete sub-objectives executed by bounded, role-specific agents (Planner, Architect, Coder, Reviewer, Verifier, Security Auditor) with formal consensus gates.
- **Capability-Based Sandboxing**: Tools do not have unrestricted host access. Every tool invocation requires cryptographic capability grants (`NETWORK`, `FILESYSTEM_READ`, `FILESYSTEM_WRITE`, `DATABASE`, `SHELL`), subject to strict CPU, memory, network, and wall-clock execution limits.
- **Four-Tier Cognitive Memory**: Working context memory, session checkpoints, cross-session episodic memory, and hybrid dense-sparse vector RAG (`pgvector` + BM25) ensure context is preserved without exceeding token windows or incurring hallucination cascades.

### 1.2 Target Personas & Primary Use Cases

| Persona                           | Operational Context                                                                          | Primary Pain Points Addressed                                                                                                                                                       |
| :-------------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Enterprise AI Architect**       | Designing autonomous code synthesis, research, and analysis pipelines                        | Prevents context drift, hallucination loops, and catastrophic unrecoverable task crashes during 60+ minute multi-step operations.                                                   |
| **Platform / SRE Engineer**       | Operating multi-tenant AI workloads in production Kubernetes clusters                        | Provides strict per-tenant token budgets, sub-millisecond Redis kill-switches, OpenTelemetry distributed tracing, and zero-downtime worker autoscaling.                             |
| **Security & Compliance Officer** | Auditing AI tool execution and protecting private IP/data                                    | Enforces capability boundaries, prevents shell injection / prompt injection escalation, logs cryptographic audit trails, and guarantees zero local data leakage to external models. |
| **Software Engineering Team**     | Utilizing multi-agent swarms for automated feature development, refactoring, and code review | Offers human-in-the-loop pause gates, visual DAG inspection, branch-isolated execution sandboxes, and automated consensus verification before merging code.                         |

### 1.3 The Problem Space: Why Legacy Agent Architectures Fail

1. **Context Window Saturation & Drift**: In single-prompt agent loops (like simple ReAct loops), bash output, compiler logs, and file dumps rapidly pollute the prompt context. Within 10 turns, the LLM forgets initial system constraints and begins inventing non-existent APIs.
2. **Cascading Hallucination Traps**: If an agent generates an incorrect assumption in Step 2, subsequent steps treat that assumption as ground truth. Without independent verifier agents and consensus voting, the entire synthesis fails silently.
3. **Volatile In-Memory State**: Most open-source agent frameworks maintain execution state in local process memory. A container restart, node preemption, or network timeout completely destroys a 45-minute task.
4. **Unconstrained Side-Effects & Security Risks**: Allowing agents to execute arbitrary shell commands directly on host workers invites container breakouts, data corruption, or denial-of-service loops.
5. **Runaway Token Economics**: Blindly dispatching multi-turn queries to high-parameter commercial models without semantic caching or smart model tiering multiplies operational inference costs tenfold.

### 1.4 Core Value Proposition & ROI Metrics

- **99.9% Resilient Recovery**: Durable PostgreSQL checkpointing allows interrupted swarms to resume from the exact last successful DAG node within 200 milliseconds of node reboot.
- **68% Token Cost Reduction**: In-flight semantic similarity caching (`@yuva-devlab/semantic-cache`) combined with the dynamic multi-tier model router routes routine tool-parsing tasks to lightweight local models (Ollama/Qwen) and reserves frontier models (Claude 3.7 / GPT-4o) for high-order architectural reasoning.
- **Zero Host Side-Effect Leaks**: All mutating tool operations run inside ephemeral Docker or gVisor sandboxes with network namespaces and strict capability quotas.
- **Deterministic Consensus Verification**: No mission-critical code or architectural artifact is marked complete until independent Reviewer and Verifier agents pass formal automated validation checks.

---

## 2. Exhaustive Feature Directory & Technical Mechanics

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ORCHESTRAI DISTRIBUTED TOPOLOGY                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                  [Operator Studio (Next.js 15 — Port 3001)]
                                     │  (HTTP / SSE / WebSocket)
                                     ▼
                  [Fastify API Gateway (Port 4001)]
                                     │  (Auth, Rate Limiting, Semantic Cache, Model Router)
     ┌───────────────────────────────┼───────────────────────────────┬───────────────────────────┐
     ▼                               ▼                               ▼                           ▼
[Realtime Rail (:4002)]     [Worker Pool (:4003)]       [Intelligence (:8082)]     [Crawler (:8083)]
 • Sub-50ms Token Bus        • BullMQ Queue Engine       • LangGraph StateGraph     • Playwright Engine
 • DAG State Streaming       • Tool Execution Sandbox    • Conversational RAG       • Markdown Parsing
     │                               │                               │                           │
     └───────────────────────────────┴───────────────┬───────────────┴───────────────────────────┘
                                                     ▼
                                      [DAG Orchestrator (gRPC :50051)]
                                                     │
                                                     ▼
                                      [PostgreSQL 16 (pgvector) & Redis 7]
```

### 2.1 Application Catalog

#### 1. Operator Studio (`apps/console` — Port `3001`)

- **Technology Stack**: Next.js 15, React 19, Tailwind CSS v4, `@yuva-devlab/ui`, `@yuva-devlab/tokens`.
- **Purpose**: The primary operational command center for human operators to inspect, monitor, steer, and debug multi-agent swarm executions in real time.
- **Detailed Features**:
  - **Live Interactive DAG Canvas**: Visualizes execution nodes (Planner, Coder, Tester, Reviewer) and directed edge state transitions in real time using SVG/Canvas rendering with color-coded node states (Pending, Running, Paused, Succeeded, Failed).
  - **Sub-50ms Token Streaming Terminal**: Streams raw agent reasoning tokens, inner monologues, and tool invocation inputs/outputs over Server-Sent Events (SSE) with auto-scrolling markdown rendering.
  - **Human-in-the-Loop (HITL) Intervention Drawer**: Allows operators to pause running graphs, review generated code diffs, approve or reject high-risk tool operations (e.g. database migrations, external network requests), and inject natural language corrections directly into the agent's working memory.
  - **Multi-Tier Memory Inspector**: Enables operators to browse working scratchpad memory, retrieve historical session checkpoints, and search the vector RAG store with cosine similarity previews.
  - **Time-Travel Execution Rewind**: Allows operators to select any historical checkpoint and fork execution into a new DAG path to test alternative reasoning strategies.

#### 2. Fastify API Gateway (`apps/gateway` — Port `4001`)

- **Technology Stack**: Fastify v4, TypeScript Node ESM, `@yuva-devlab/auth-server`, `@yuva-devlab/semantic-cache`.
- **Purpose**: High-throughput public and internal ingress handling authentication, token validation, rate limiting, semantic caching, and dynamic model routing.
- **Detailed Features**:
  - **High-Throughput Ingress Engine**: Optimized Fastify pipeline capable of processing 35,000+ requests per second with sub-5ms overhead.
  - **Sub-Millisecond Redis Authentication Cache**: Validates client Bearer API keys (`dl_live_...`) against Redis in under 1ms, falling back to PostgreSQL only on cache misses.
  - **Instant Kill-Switch Interceptor**: Subscribes to the ecosystem Redis pub/sub channel `devlab:killswitch:events`. If a tenant, user, or key is revoked in DevLab Portal, Gateway drops all in-flight and incoming requests within 1 millisecond.
  - **Semantic Completion Cache**: Hashes prompt embeddings via `@yuva-devlab/semantic-cache`. If an incoming prompt matches a previously executed query with cosine similarity > 0.96, the gateway returns the cached completion instantly, bypassing LLM inference entirely.
  - **Dynamic Model Router Integration**: Evaluates task complexity, context length, and budget constraints to dispatch requests to the optimal LLM provider.

#### 3. Realtime Streaming Rail (`apps/realtime` — Port `4002`)

- **Technology Stack**: Node.js HTTP/2, Server-Sent Events (SSE), Redis Pub/Sub.
- **Purpose**: Low-latency, unidirectional event dissemination engine delivering live agent output to browser clients.
- **Detailed Features**:
  - **Lightweight SSE Connection Pooling**: Maintains persistent HTTP/2 SSE connections with client browsers, eliminating the bidirectional socket overhead of WebSockets while ensuring sub-50ms token delivery.
  - **Topic-Based Channel Multiplexing**: Clients subscribe to `/api/v1/realtime/sessions/:sessionId/stream` to receive filtered streams of `token:delta`, `tool:call:start`, `tool:call:complete`, `node:transition`, and `dag:status` events.
  - **Automatic Reconnection & Event Replay**: Clients pass `Last-Event-ID` on reconnection; the realtime rail retrieves buffered events from a Redis sliding-window list to guarantee zero message loss during temporary network drops.

#### 4. Distributed Worker Cluster (`apps/worker` — Port `4003`)

- **Technology Stack**: Node.js, BullMQ v5, Redis 7, Docker API / gVisor sandbox.
- **Purpose**: Background execution engine processing long-running compute jobs, sandboxed tool executions, and asynchronous batch operations.
- **Detailed Features**:
  - **Hierarchical Job Orchestration**: BullMQ parent-child job workflows ensure that sub-agent tasks execute concurrently while synchronizing at barrier nodes before proceeding down the DAG.
  - **Capability-Sandboxed Tool Execution**: Executes tool actions inside isolated container sandboxes with read-only root filesystems, ephemeral scratch mounts, and restricted Linux capabilities.
  - **Exponential Backoff & Dead-Letter Queues (DLQ)**: Failed tasks automatically retry with randomized exponential backoff (e.g. 1s, 2s, 4s, 8s + jitter). Persistent failures are pushed to a DLQ and trigger alerts to IncidentAI.
  - **Prometheus Worker Telemetry**: Exposes queue depth, active job count, execution latency percentiles (p50, p95, p99), and failure rates at `/metrics`.

#### 5. Intelligence Engine (`apps/intelligence` — Port `8082`)

- **Technology Stack**: Python 3.12, FastAPI, LangGraph, PyTorch, HuggingFace Transformers.
- **Purpose**: Deep cognitive reasoning service implementing cyclical StateGraph execution, supervisor-worker multi-agent consensus, and conversational RAG.
- **Detailed Features**:
  - **Cyclical StateGraph Workflows**: Compiles LangGraph state graphs supporting conditional routing, cycles (e.g. write code -> run tests -> if fail, repeat up to max steps), and state reducer functions.
  - **Supervisor-Worker Consensus Engine**: Implements multi-agent voting strategies (Unanimous, Majority, Weighted Authority) where a Supervisor agent synthesizes inputs from specialized Worker nodes.
  - **Conversational RAG with Cross-Encoder Reranking**: Ingests queries, retrieves candidate documents from `pgvector`, and applies a cross-encoder reranking model (`bge-reranker-large`) to prune false positives before context assembly.

#### 6. Headless Web Crawler (`apps/crawler` — Port `8083`)

- **Technology Stack**: Node.js, Playwright, Chromium, Turndown (HTML-to-Markdown).
- **Purpose**: High-fidelity web extraction engine for automated documentation gathering, web research, and external API schema discovery.
- **Detailed Features**:
  - **JavaScript-Rendered Content Extraction**: Boots headless Chromium instances to execute client-side JavaScript, bypass SPAs, and capture fully hydrated DOM structures.
  - **Clean Markdown Sanitization**: Strips navigation bars, footers, advertisements, cookie banners, and CSS clutter, converting raw article bodies into clean, token-efficient markdown.
  - **Anti-Bot & Rate-Limiting Protection**: Implements user-agent rotation, request throttling, and domain-level backoff to respect website `robots.txt` and prevent IP blocking.

#### 7. Admin Service (`apps/admin` — Port `4005`)

- **Technology Stack**: Fastify v4, Prisma ORM, `@orchestrai/database`.
- **Purpose**: Internal control plane managing tenant provisioning, LLM quota policies, model provider credentials, and global system health.
- **Detailed Features**:
  - **Tenant Quota & Token Budget Management**: Sets per-tenant daily and monthly token caps, maximum concurrent DAG executions, and allowed LLM tiers.
  - **System Telemetry Aggregator**: Aggregates health metrics across all 8 microservices and reports global cluster status.

#### 8. DAG Orchestrator (`apps/orchestrator` — gRPC Port `50051`)

- **Technology Stack**: Node.js gRPC, Protocol Buffers v3, C++ bindings.
- **Purpose**: High-frequency, low-latency binary transport layer for synchronizing distributed StateGraph checkpoints and coordinating microsecond state transitions between workers.
- **Detailed Features**:
  - **Binary Protobuf Serialization**: Eliminates JSON serialization overhead, reducing checkpoint payload sizes by up to 70% and serialization CPU cycles by 85%.
  - **Bi-Directional gRPC Streaming**: Enables streaming coordination between distributed worker nodes and the centralized graph state coordinator.

---

### 2.2 Core Package Catalog

| Package                         | Lines | Core Responsibilities & Invariants                                                                                                                                                                                           |
| :------------------------------ | :---: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@orchestrai/core`**          | < 200 | **Absolute Source of Truth**: Zero internal workspace dependencies. Defines base execution contexts, state schemas, Zod validation models, and core error hierarchies.                                                       |
| **`@orchestrai/shared-types`**  | < 200 | **Canonical Domain Enums**: Contains all domain enums (`ExecutionStatus`, `AgentMode`, `MessageRole`, `ToolCapability`, `StateTransition`, `ConsensusStrategy`). Strict rule: zero bare string literals across the platform. |
| **`@orchestrai/agent`**         | < 250 | **ReAct Cognitive Loop**: Implements the core Reason -> Act -> Observe execution loop, human-in-the-loop pause gates, planning cycles, and self-reflection mechanics.                                                        |
| **`@orchestrai/runtime`**       | < 250 | **StateGraph Runtime Adapters**: Executes task nodes, coordinates conditional branching, evaluates edge conditions, and resolves multi-agent consensus.                                                                      |
| **`@orchestrai/models`**        | < 250 | **Multi-Provider LLM Adapters**: Unified client abstraction supporting Ollama (local), Anthropic Claude, OpenAI, and DeepSeek with standardized streaming and structured JSON output.                                        |
| **`@orchestrai/model-router`**  | < 250 | **Dynamic Model Optimization**: Evaluates prompt complexity, context size, and user budget to select the optimal model candidate (cost, latency, or quality prioritized).                                                    |
| **`@orchestrai/tools`**         | < 250 | **Capability-Sandboxed Tool Harness**: Wraps tool executions in capability checks (`NETWORK`, `FILESYSTEM_READ`, `FILESYSTEM_WRITE`, `DATABASE`, `SHELL`) with strict timeouts.                                              |
| **`@orchestrai/memory`**        | < 250 | **Four-Tier Memory Engine**: Manages Working Memory, Short-Term State Checkpoints, Long-Term Episodic Memory, and Vector RAG Memory.                                                                                         |
| **`@orchestrai/rag`**           | < 250 | **Dense-Sparse Hybrid Retrieval**: Combines pgvector cosine similarity search with BM25 keyword matching and reciprocal rank fusion (RRF).                                                                                   |
| **`@orchestrai/database`**      | < 250 | **Prisma ORM & PostgreSQL Schema**: Manages relational schema migrations, connection pooling, and transactional checkpoint persistence.                                                                                      |
| **`@orchestrai/queue`**         | < 250 | **BullMQ Queue Management**: Defines queue topologies, delayed job schedulers, rate-limited worker pools, and metrics collectors.                                                                                            |
| **`@orchestrai/events`**        | < 250 | **Transactional Outbox & Event Bus**: Implements durable domain event dispatching, idempotency key checking, and Redis pub/sub bridges.                                                                                      |
| **`@orchestrai/observability`** | < 250 | **OpenTelemetry & Prometheus**: Injects trace contexts across HTTP, gRPC, and BullMQ boundaries, exporting metrics and structured logs.                                                                                      |
| **`@orchestrai/regex`**         | < 150 | **Centralized Regular Expressions**: Zero inline regexes rule. Houses all validated regex patterns for sanitization, parsing, and token matching.                                                                            |
| **`@orchestrai/sdk`**           | < 250 | **Client Orchestration SDK**: TypeScript client library for interacting with Gateway APIs, initiating swarms, and consuming SSE streams.                                                                                     |
| **`@orchestrai/prompts`**       | < 200 | **Dynamic Prompt Builder**: Composes system prompts, role instructions, tool schemas, and few-shot exemplars driven by database configuration.                                                                               |
| **`@orchestrai/eval`**          | < 250 | **Evaluation & Benchmark Suite**: Measures swarm reasoning accuracy, tool selection correctness, and detects hallucination anomalies.                                                                                        |
| **`@orchestrai/grpc`**          | < 200 | **gRPC Stubs & Protobuf Compilations**: Precompiled Protobuf bindings for orchestrator communication.                                                                                                                        |

---

## 3. Inter-System Ecosystem Collaboration ("How It Works With Others")

```mermaid
sequenceDiagram
    autonumber
    participant Op as Operator Studio (:3001)
    participant GW as Gateway (:4001)
    participant DP as DevLab Portal (:3015)
    participant Redis as Redis (:6379)
    participant Worker as Worker Pool (:4003)
    participant DL as DevLab Logs (:3020)
    participant IA as IncidentAI (:8085)

    Op->>GW: POST /api/v1/sessions/start (Bearer dl_live_...)
    GW->>Redis: 1. Validate API Key & Tenant Quota (<1ms)
    alt Key Invalid or Revoked
        Redis-->>GW: Key Revoked / Quota Exceeded
        GW-->>Op: 401 Unauthorized / 429 Quota Exceeded
    else Key Approved
        Redis-->>GW: Key Valid (Tenant: org_enterprise_88)
        GW->>Worker: 2. Enqueue DAG Workflow to BullMQ
        GW-->>Op: 202 Accepted (Session ID: sess_9901)
    end

    Worker->>Worker: 3. Execute Sandboxed Multi-Agent Swarm
    Worker->>DL: 4. Stream Structured Spans & Logs (:3020)

    alt Tool Crash or Unhandled Exception
        Worker->>IA: 5. Emit Webhook Alert to IncidentAI (:8085)
        IA->>Worker: 6. Spin up Isolated Sandbox & Run Auto-Fix
    else Swarm Completed Successfully
        Worker->>Redis: 7. Publish State Machine Transition
        Redis->>Op: 8. Stream Completion Artifacts via Realtime SSE (:4002)
    end
```

### 3.1 Inter-Repository Integration Matrix

| Ecosystem Member    | Direction | Protocol & Transport                                   | Exact Payload Contract & Endpoint                     | Purpose & Operational Behavior                                                                                                                |
| :------------------ | :-------: | :----------------------------------------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **`devlab-portal`** |  Inbound  | Redis Pub/Sub (`devlab:killswitch:events`) & HTTP JWKS | `GET http://localhost:3015/api/v1/keys/verify`        | Gateway validates API keys and enforces sub-1ms instant revocation when an administrator disables an enterprise key in Portal.                |
| **`devlab-logs`**   | Outbound  | HTTP/2 POST / Kafka                                    | `POST http://localhost:3020/api/v1/logs/ingest`       | Worker and Gateway stream all structured JSON logs, LLM token counts, tool invocation latency, and error traces to DevLab Logs.               |
| **`incidentai`**    | Outbound  | HTTP POST Webhook                                      | `POST http://localhost:8085/api/v1/incidents/webhook` | Worker dispatches runtime exceptions, sandbox crashes, and memory leaks to IncidentAI to trigger autonomous SRE root-cause diagnosis.         |
| **`devlab-guard`**  |  Inbound  | Local CLI / Git Hook / CI                              | `uv run devlab-guard scan --path .`                   | Scans all TypeScript and Python code before commit to strictly enforce the 250-line rule, zero raw string enums, and centralized regex rules. |
| **`devlab-shared`** |  Static   | Internal npm Workspace (`@yuva-devlab/*`)              | Direct package import                                 | Imports `@yuva-devlab/ui`, `@yuva-devlab/tokens`, `@yuva-devlab/resilience` (circuit breakers), and `@yuva-devlab/semantic-cache`.            |
| **`finai`**         | Cross-App | REST HTTP API / gRPC                                   | `POST http://localhost:4000/api/v1/advisory/analyze`  | Can invoke FinAI's pure financial engine for deterministic arithmetic calculations during complex portfolio or wealth management reasoning.   |

---

## 4. Technical Guidelines & Invariant Rules

### 4.1 Prime Non-Negotiable Invariants

1. **Hard 250-Line Maximum Rule**:
   - NO file across `apps/*` or `packages/*` may exceed **250 lines of code**.
   - When a file reaches **200 lines**, decompose it immediately into focused sub-modules (e.g. schemas, helpers, handlers).
2. **Zero Hardcoded Strings, Models & Strict Enums**:
   - NO raw string literals for statuses (`"completed"` ❌ -> `ExecutionStatus.COMPLETED` ✅), roles (`"user"` ❌ -> `MessageRole.USER` ✅), or capabilities.
   - NO hardcoded fallback model strings (e.g. `"gemma4:31b"`, `"qwen2.5:7b"`). All models must be dynamically supplied via DB configuration or environment variables.
   - Zero synthetic fallback agents or auto-seeding. If a tenant has no agent configured, fail fast with a descriptive error.
3. **Dynamic Server-Driven Configuration**:
   - Operational parameters (max execution steps, sampling temperatures, compaction thresholds, cache TTLs, starter suggestions) must be served via Gateway APIs (`/api/v1/platform/...`) and cached with stale-while-revalidate IndexedDB persistence.
4. **Centralized Regular Expressions**:
   - All regular expressions must originate from `@orchestrai/regex`. Zero inline regexes.

---

## 5. Developer Usage Guidelines & Operations Manual

### 5.1 Local Prerequisites

- **Node.js**: `v22.x` or later (ESM native).
- **pnpm**: `v9.x` or later (`corepack enable pnpm`).
- **Python**: `3.12+` with `uv` package manager (for `apps/intelligence`).
- **Docker & Docker Compose**: For local PostgreSQL 16 (`pgvector`) and Redis 7.

### 5.2 Step-by-Step Installation & Bootstrapping

```bash
# 1. Clone the repository
git clone https://github.com/yuvadevlab/orchestrai.git
cd orchestrai

# 2. Install workspace dependencies
pnpm install

# 3. Start local infrastructure (PostgreSQL & Redis)
docker compose up -d postgres redis

# 4. Generate Prisma Client and run migrations
pnpm db:generate
pnpm db:migrate

# 5. Start the full distributed development environment (Turbo)
pnpm dev

# 6. Verify all monorepo typechecks pass cleanly
pnpm typecheck
```

### 5.3 Complete Environment Variables Reference

| Variable                 |  Type  |         Default          | Required | Description                                                                                |
| :----------------------- | :----: | :----------------------: | :------: | :----------------------------------------------------------------------------------------- |
| `PORT`                   | Number |          `4001`          |   Yes    | Gateway API HTTP listening port.                                                           |
| `DATABASE_URL`           | String |            —             |   Yes    | PostgreSQL connection string (`postgresql://postgres:postgres@localhost:5432/orchestrai`). |
| `REDIS_URL`              | String | `redis://localhost:6379` |   Yes    | Redis connection string for BullMQ queues, caching, and kill-switch events.                |
| `REALTIME_URL`           | String | `http://localhost:4002`  |   Yes    | Realtime SSE streaming rail service endpoint.                                              |
| `WORKER_METRICS_URL`     | String | `http://localhost:4003`  |   Yes    | Distributed BullMQ worker pool metrics endpoint.                                           |
| `INTELLIGENCE_URL`       | String | `http://localhost:8082`  |   Yes    | Python LangGraph cognitive reasoning engine endpoint.                                      |
| `CRAWLER_URL`            | String | `http://localhost:8083`  |   Yes    | Headless Chromium web extraction engine endpoint.                                          |
| `ADMIN_URL`              | String | `http://localhost:4005`  |   Yes    | Fastify internal admin control plane endpoint.                                             |
| `ORCHESTRATOR_GRPC_URL`  | String |    `localhost:50051`     |   Yes    | gRPC binary DAG orchestrator endpoint.                                                     |
| `DEVLAB_PORTAL_URL`      | String | `http://localhost:3015`  |   Yes    | DevLab Portal API URL for key validation and audit events.                                 |
| `DEVLAB_LOGS_URL`        | String | `http://localhost:3020`  |   Yes    | DevLab Logs ingestion endpoint for structured streaming.                                   |
| `INCIDENTAI_WEBHOOK_URL` | String | `http://localhost:8085`  |    No    | IncidentAI webhook endpoint for automated crash reporting.                                 |

### 5.4 Starting a Multi-Agent Swarm Session via API

```bash
curl -X POST http://localhost:4001/api/v1/sessions/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dl_live_production_key_123" \
  -d '{
    "objective": "Design and implement a zero-downtime database migration for tenant billing records",
    "targetService": "database",
    "agentMode": "autonomous_swarm",
    "budgetLimitTokens": 75000,
    "consensusStrategy": "MAJORITY_VOTE"
  }'
```

### 5.5 Listening to the Real-Time Execution Stream

```bash
curl -N -H "Accept: text/event-stream" \
  -H "Authorization: Bearer dl_live_production_key_123" \
  http://localhost:4002/api/v1/realtime/sessions/sess_9901/stream
```

### 5.6 Troubleshooting & Runbook Recipes

- **Issue: Gateway returns 503 "Redis connection failed"**
  - _Fix_: Verify Redis container is running: `docker ps | grep redis`. Check logs: `docker logs orchestrai-redis`.
- **Issue: BullMQ workers not picking up tasks**
  - _Fix_: Inspect queue health: `curl http://localhost:4003/metrics`. Ensure Redis memory limits haven't triggered `OOM command not allowed`.
- **Issue: Python Intelligence Engine fails to compile StateGraph**
  - _Fix_: Verify Python environment: `cd apps/intelligence && uv run uvicorn main:app --reload --port 8082`.
