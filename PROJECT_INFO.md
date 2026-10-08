# OrchestrAI — Product Specification, Technical Dossier & Operations Manual

---

## 1. Executive Product Dossier & Market Vision

### 1.1 The Operational Problem Space

Single-agent AI systems (e.g. conversational chat wrappers, monolithic assistants) fail catastrophically when applied to complex, multi-step enterprise workflows:

- **Context Window Pollution**: When a single LLM attempts to plan, write code, run tests, and debug errors in one prompt loop, the context window saturates with transient execution logs, causing the agent to lose its original objective.
- **Unchecked Hallucination Cascades**: Without independent multi-agent verification gates, an agent acts on speculative assumptions, compounding errors down the execution tree.
- **Fragile Volatile State**: If a long-running 45-minute research or software synthesis task crashes mid-stream, all computational work is lost without durable checkpointing.
- **Dangerous Unconstrained Side-Effects**: Executing shell commands or arbitrary code directly on host machines risks host compromise, irreversible data destruction, or resource starvation.
- **Prohibitive Inference Costs**: Repetitive queries generate redundant model inferences, multiplying LLM token spend across swarms.

### 1.2 The OrchestrAI Value Proposition

**OrchestrAI** is an **Enterprise Distributed AI Agent Orchestration Platform** engineered to execute complex, long-running objectives through autonomous multi-agent swarms, sandboxed tool harnesses, durable state graphs, multi-tier memory, and resilient execution DAGs:

1. **Dynamic Directed Acyclic Graph (DAG) Swarms**: Monolithic tasks are decomposed into structured dependency graphs executed by specialized, role-bounded agents (Researcher, Architect, Coder, Reviewer, Verifier).
2. **Durable StateGraph Checkpointing with LangGraph**: Every state transition, agent thought, and tool execution is persisted into PostgreSQL, enabling resilient crash recovery and time-travel rollbacks.
3. **Four-Tier Cognitive Memory Hierarchy**: Combines ephemeral working memory, session episodic history, long-term retrospective archives, and hybrid dense-sparse vector RAG powered by `pgvector`.
4. **Sandboxed Capability-Based Tool Harness**: Every tool execution runs within capability boundaries (`NETWORK`, `FILESYSTEM_READ`, `FILESYSTEM_WRITE`, `DATABASE`) in isolated sandboxes with strict execution deadlines.
5. **Real-Time Token Streaming Bus**: Emits sub-50ms token deltas, tool call previews, and DAG state updates to the Operator Studio via Server-Sent Events (SSE).
6. **Ecosystem-Wide Gateway Synchronization**: Integrates directly with DevLab Portal for instant API key validation and sub-millisecond Redis kill-switch evictions.

---

## 2. Exhaustive Feature Matrix & Deep Technical Explanation

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ORCHESTRAI DISTRIBUTED TOPOLOGY                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
                 [Operator Studio / Console (Next.js - Port 3001)]
                                │  (HTTP / SSE / WebSocket)
                                ▼
                 [Fastify API Gateway (Port 4001)]
                                │  (Auth, Rate Limiting, Semantic Cache, Model Router)
                                │
    ┌───────────────────────────┼───────────────────────────┬────────────────────────────┐
    ▼                           ▼                           ▼                            ▼
[Realtime SSE (:4002)]  [Worker Pool (:4003)]   [Intelligence (:8082)]   [Crawler (:8083)]
 • Live Token Bus        • BullMQ Queue          • LangGraph StateGraph   • Playwright
 • DAG State Streaming   • Tool Execution        • Conversational RAG     • Web Extraction
    │                           │                           │                            │
    └───────────────────────────┴─────────────┬─────────────┴────────────────────────────┘
                                              ▼
                                 [DAG Orchestrator (gRPC :50051)]
                                              │
                                              ▼
                               [PostgreSQL + pgvector & Redis]
```

---

### Application Layer Breakdown

#### 1. Operator Studio (`apps/console` — Port `3001`)

- **Technology**: Next.js 15, React 19, Tailwind CSS, `@yuva-devlab/ui`.
- **Capabilities**:
  - Interactive DAG visualizer displaying live execution node transitions.
  - Multi-agent conversational timeline rendering streaming markdown and tool call cards.
  - Operator steering controls: pause graph, review diffs, inject feedback, or cancel tasks.
  - Multi-tier memory inspection drawer.

#### 2. Fastify API Gateway (`apps/gateway` — Port `4001`)

- **Technology**: Fastify, TypeScript Node ESM.
- **Capabilities**:
  - High-throughput ingress serving up to 35,000 req/sec.
  - Authenticates client tokens using `@yuva-devlab/auth-server` and sub-1ms Redis cache lookups.
  - Intercepts live kill-switch revocation signals via `killswitch.middleware.ts`.
  - Integrates `@yuva-devlab/semantic-cache` to return cached model completions for identical embedding queries.
  - Dynamically routes inference requests via `@orchestrai/model-router`.

#### 3. Realtime Streaming Rail (`apps/realtime` — Port `4002`)

- **Technology**: Node.js SSE / WebSockets, Redis Pub/Sub.
- **Capabilities**:
  - Streams execution tokens and DAG state shifts to browser clients with <50ms latency.
  - Uses Server-Sent Events for lightweight unidirection streaming, eliminating WebSocket connection overhead.

#### 4. Distributed Worker Service (`apps/worker` — Port `4003`)

- **Technology**: BullMQ, Redis 7.
- **Capabilities**:
  - Distributes heavy compute jobs (code execution, embeddings, report compilation) across worker clusters.
  - Manages parent-child job hierarchies, concurrency quotas, and exponential backoff retries.

#### 5. Python Intelligence Engine (`apps/intelligence` — Port `8082`)

- **Technology**: Python 3.12, FastAPI, LangGraph, PyTorch.
- **Capabilities**:
  - Manages cyclical StateGraph execution workflows and supervisor-worker consensus.
  - Executes Conversational RAG with dense vector retrieval and cross-encoder reranking.

#### 6. Headless Web Crawler (`apps/crawler` — Port `8083`)

- **Technology**: Node.js, Playwright, Chromium.
- **Capabilities**:
  - Crawls public documentation, API references, and web search results in headless browser sandboxes.
  - Extracts clean markdown content for automated ingestion into vector memory.

#### 7. Admin Service (`apps/admin` — Port `4005`)

- **Technology**: Fastify.
- **Capabilities**: Internal tenant management, quota configuration, and system telemetry metrics.

#### 8. DAG Orchestrator (`apps/orchestrator` — gRPC Port `50051`)

- **Technology**: Protocol Buffers, gRPC.
- **Capabilities**: Low-latency binary communication for distributed StateGraph synchronization.

---

### Core Package Catalog

| Package                         | Purpose & Core Invariants                                                                                                 |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| **`@orchestrai/core`**          | Absolute source of truth with ZERO workspace dependencies. Defines base execution contexts, state schemas, and contracts. |
| **`@orchestrai/shared-types`**  | Canonical domain enums (`ExecutionStatus`, `AgentMode`, `MessageRole`, `ToolCapability`). Zero bare string literals.      |
| **`@orchestrai/agent`**         | Core agent loop implementing ReAct (Reason + Act + Observe) and human-in-the-loop pause gates.                            |
| **`@orchestrai/runtime`**       | LangGraph runtime adapters executing task nodes and resolving consensus.                                                  |
| **`@orchestrai/models`**        | Multi-provider LLM adapters (Ollama, Anthropic Claude, OpenAI, DeepSeek) supporting streaming and structured outputs.     |
| **`@orchestrai/tools`**         | Sandboxed tool harnesses with capability-based security (`NETWORK`, `FILESYSTEM`, `DATABASE`).                            |
| **`@orchestrai/memory`**        | Multi-tier memory engine (Working Memory, Short-Term Checkpoints, Long-Term Episodic Memory).                             |
| **`@orchestrai/rag`**           | Hybrid dense-sparse retrieval combining pgvector embeddings with BM25 keyword matching.                                   |
| **`@orchestrai/database`**      | Prisma ORM and PostgreSQL schema for durable state machines, sessions, and runs.                                          |
| **`@orchestrai/queue`**         | BullMQ queue definitions, delayed job schedulers, and worker metrics collectors.                                          |
| **`@orchestrai/events`**        | Event bus contracts, transactional outbox pattern, and idempotency stores.                                                |
| **`@orchestrai/observability`** | OpenTelemetry tracing spans, Prometheus metrics exports, and structured JSON logs.                                        |

---

## 3. How OrchestrAI Interacts with the Multi-Repo Ecosystem

```mermaid
sequenceDiagram
    autonumber
    participant Op as Operator / Studio (:3001)
    participant GW as Gateway (:4001)
    participant DP as DevLab Portal (:3010)
    participant Redis as Redis (:6379)
    participant Worker as Worker Pool (:4003)
    participant DL as DevLab Logs (:3020)
    participant IA as IncidentAI (:8085)

    Op->>GW: POST /api/v1/sessions/start (Bearer dl_live_...)
    GW->>Redis: Check Key & Tenant Quota (<1ms)
    Redis-->>GW: Key Approved
    GW->>Worker: Enqueue DAG Task to BullMQ
    Worker->>Worker: Execute Sandboxed Multi-Agent Swarm
    Worker->>DL: Stream Log Records & Spans (:3020)
    alt Fatal Error or Timeout Detected
        Worker->>IA: Emit Alert to IncidentAI (:8085)
        IA->>Worker: Run Sandbox Reproduction & Auto-Fix
    end
    Worker->>GW: Publish Completion Result
    GW-->>Op: Stream Final Deliverables & Artifacts
```

### Detailed Ecosystem Interaction Matrix

| Ecosystem Member    | Direction | Protocol / Transport        | Data Payload / Contract                                                                                           |
| :------------------ | :-------: | :-------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **`devlab-portal`** |  Inbound  | Redis Pub/Sub & JWKS HTTP   | Validates client API keys via Redis cache; intercepts live kill-switch revocation events within 1ms.              |
| **`devlab-logs`**   | Outbound  | HTTP POST (`:3020`) / Kafka | Streams all swarm execution logs, tool invocation inputs/outputs, model token counts, and error traces.           |
| **`incidentai`**    | Outbound  | Webhook HTTP POST (`:8085`) | Dispatches runtime crashes and timeout exceptions to trigger autonomous SRE self-healing drills.                  |
| **`devlab-guard`**  |  Inbound  | Git Pre-commit / CI CLI     | Scans agent files and packages on every commit to enforce the 250-line rule and zero magic strings.               |
| **`devlab-shared`** |  Static   | Internal npm package link   | Consumes `@yuva-devlab/resilience` (circuit breakers), `@yuva-devlab/semantic-cache`, and `@yuva-devlab/billing`. |

---

## 4. Technical Guidelines & Invariants

### 4.1 Prime Non-Negotiable Invariants

1. **Hard 250-Line Maximum Rule**: NO file across `apps/*` or `packages/*` may exceed 250 lines of code. Decompose early at 200 lines.
2. **Zero Hardcoded Strings, Models & Strict Enums**:
   - Zero raw strings for domain entities, statuses, roles, or modes.
   - Always compare using `Enum.KEY` (e.g. `status === ExecutionStatus.COMPLETED`).
   - Zero hardcoded fallback model names (e.g. `"gemma4:31b"`, `"qwen2.5:7b"`). All models are database- or environment-driven.
   - Zero synthetic auto-seeding. If a tenant has no agent, fail fast with a descriptive error.
3. **Dynamic Server-Driven Configuration**: All operational parameters (slash commands, system prompts, max execution steps, sampling temperatures) must originate from control plane database configs.
4. **Centralized Regex Only**: All regular expressions must originate from `@orchestrai/regex`. Zero inline regexes.

---

## 5. Complete Usage Runbook & Operations Manual

### 5.1 Installation & Monorepo Setup

```bash
# Clone the repository
git clone https://github.com/yuvadevlab/orchestrai.git
cd orchestrai

# Install dependencies across all 25+ packages
pnpm install

# Run database migrations and generate Prisma client
pnpm db:generate
pnpm db:migrate

# Start the complete distributed development cluster
pnpm dev

# Typecheck the entire monorepo (42/42 tasks FULL TURBO)
pnpm typecheck
```

### 5.2 Launching an Autonomous Multi-Agent Swarm Session

```bash
curl -X POST http://localhost:4001/api/v1/sessions/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dl_live_prod_key_992" \
  -d '{
    "objective": "Refactor authentication middleware to support OIDC JWKS token validation",
    "targetService": "gateway",
    "agentMode": "autonomous_swarm",
    "budgetLimitTokens": 50000
  }'
```

### 5.3 Environment Variables Reference

| Variable             | Type   | Default                  | Description                                                   |
| :------------------- | :----- | :----------------------- | :------------------------------------------------------------ |
| `PORT`               | Number | `4001`                   | Gateway API HTTP port.                                        |
| `DATABASE_URL`       | String | Required                 | PostgreSQL connection string (`:5432`).                       |
| `REDIS_URL`          | String | `redis://localhost:6379` | Redis connection URL for queues, cache, and kill-switch rail. |
| `REALTIME_URL`       | String | `http://localhost:4002`  | Realtime SSE streaming rail endpoint.                         |
| `WORKER_METRICS_URL` | String | `http://localhost:4003`  | BullMQ worker pool metrics endpoint.                          |
| `INTELLIGENCE_URL`   | String | `http://localhost:8082`  | Python LangGraph intelligence engine endpoint.                |
| `DEVLAB_LOGS_URL`    | String | `http://localhost:3020`  | Ingestion endpoint for streaming structured logs.             |
| `DEVLAB_PORTAL_URL`  | String | `http://localhost:3010`  | DevLab Portal control plane endpoint.                         |
