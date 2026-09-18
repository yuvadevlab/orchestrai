# OrchestrAI

> A reusable, local-first AI agent platform designed to provide agent orchestration, tools, memory, RAG, realtime execution, event-driven workflows, background processing, evaluation, observability, and AI/ML capabilities that can be integrated into FinAI and future applications.

---

# 0. Document Purpose

This document is the **single source of truth for OrchestrAI implementation**.

It serves four purposes:

1. **Implementation roadmap**
2. **Architecture specification**
3. **AI coding-agent continuation state**
4. **Software Architecture / Tech Lead learning guide**

This is not merely a task checklist.

Every implementation should simultaneously produce:

```text
Working Software
        +
Good Architecture
        +
Engineering Documentation
        +
Learning Material
        +
Interview Knowledge
```

The project should be developed incrementally.

Do not attempt to implement the entire platform at once.

---

# 1. Core Product Idea

OrchestrAI is not intended to be a traditional chatbot.

The core idea is:

> **Don't just tell me. Orchestrate it.**

The platform should allow an agent to:

```text
Understand
    ↓
Plan
    ↓
Select tools
    ↓
Execute
    ↓
Observe
    ↓
Adapt
    ↓
Ask for approval when required
    ↓
Resume
    ↓
Complete
```

The platform should support:

* agents
* agent modes
* model abstraction
* tool calling
* workflows
* stateful execution
* human-in-the-loop
* memory
* RAG
* background execution
* queues
* workers
* domain events
* realtime streaming
* WebSockets
* SSE
* observability
* evaluation
* security
* resilience
* SDK integration
* multi-agent orchestration

---

# 2. Fundamental Boundary

The most important architectural boundary is:

```text
Application-specific logic
        ≠
Generic AI infrastructure
```

For example:

```text
FinAI
 ├── Finance domain
 ├── Transactions
 ├── Accounts
 ├── Budgets
 ├── Goals
 └── Finance-specific tools

             ↓

       OrchestrAI

 ├── Agent execution
 ├── Tool orchestration
 ├── Model abstraction
 ├── Memory infrastructure
 ├── RAG infrastructure
 ├── Events
 ├── Queues
 ├── Realtime
 ├── Observability
 └── Evaluation
```

FinAI owns finance business rules.

OrchestrAI owns generic AI infrastructure.

---

# 3. Architectural Evolution Strategy

## Important decision

OrchestrAI will initially be built as **ONE repository and ONE pnpm workspace**.

We will NOT create 15+ Git repositories immediately.

The initial architecture is:

```text
orchestrai/
│
├── apps/
├── packages/
├── infrastructure/
├── docs/
└── ORCHESTRAI-IMPLEMENTATION.md
```

This is a **modular monorepo architecture**.

The fact that everything is in one repository does NOT mean everything should be tightly coupled.

---

# 4. Future Extraction Strategy

The long-term strategy is:

> **One repository now. Independently extractable packages and services later.**

As the system matures, stable components may be extracted into:

```text
@orchestrai/core
@orchestrai/models
@orchestrai/tools
@orchestrai/agent
@orchestrai/events
@orchestrai/queue
@orchestrai/sdk
@orchestrai/observability
```

and deployable services may become:

```text
orchestrai-gateway
orchestrai-runtime
orchestrai-worker
orchestrai-realtime
orchestrai-rag
orchestrai-memory
```

But extraction must happen because there is a **real architectural or organizational reason**, not simply because the repository has become large.

---

# 5. Important Architecture Vocabulary

The project should deliberately teach the following concepts.

## Architecture

```text
Modular Architecture
Modular Monolith
Hexagonal Architecture
Clean Architecture
Layered Architecture
Event-Driven Architecture
Distributed Systems
Service-Oriented Architecture
Microservices
Polyglot Architecture
```

## Domain Design

```text
Domain-Driven Design
Bounded Context
Entity
Value Object
Aggregate
Repository
Application Service
Domain Service
```

## Design Patterns

```text
Dependency Injection
Dependency Inversion
Adapter
Strategy
Factory
Repository
Observer
Command
State Machine
Pipeline
Facade
Decorator
Circuit Breaker
Bulkhead
Retry
Outbox
Saga
```

## Distributed Systems

```text
Producer
Consumer
Queue
Worker
Pub/Sub
Event Stream
Consumer Group
Backpressure
Idempotency
Eventual Consistency
Strong Consistency
Distributed Lock
Distributed Transaction
```

## AI Engineering

```text
LLM
Agent
Tool
Planner
Executor
State Graph
Checkpoint
Human-in-the-loop
RAG
Embedding
Vector Search
Reranking
Evaluation
LLM-as-Judge
Prompt Injection
Tool Authorization
```

## Reliability

```text
Timeout
Retry
Exponential Backoff
Jitter
Circuit Breaker
Bulkhead
Rate Limiting
Dead Letter Queue
Graceful Shutdown
Health Check
Readiness
Liveness
```

## Observability

```text
Logging
Metrics
Tracing
OpenTelemetry
Trace ID
Span ID
Correlation ID
SLI
SLO
SLA
```

The coding agent must explain these concepts when they become relevant.

---

# 6. Repository Structure — Initial State

The initial OrchestrAI repository should look approximately like:

```text
orchestrai/
│
├── apps/
│   ├── gateway/
│   ├── worker/
│   ├── realtime/
│   └── console/
│
├── packages/
│   ├── core/
│   ├── models/
│   ├── tools/
│   ├── agent/
│   ├── runtime/
│   ├── queue/
│   ├── events/
│   ├── memory/
│   ├── rag/
│   ├── observability/
│   └── sdk/
│
├── infrastructure/
│   ├── docker/
│   ├── postgres/
│   ├── redis/
│   ├── ollama/
│   ├── nginx/
│   └── monitoring/
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── learning/
│   └── interview/
│
├── scripts/
│
├── ORCHESTRAI-IMPLEMENTATION.md
├── ARCHITECTURE.md
├── AGENT.md
├── EVENTS.md
├── TOOL-CONTRACT.md
├── EXECUTION-LIFECYCLE.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

# 7. Repository vs Package vs Service

This distinction must remain clear.

```text
Repository
    ↓
Source-control boundary

Package
    ↓
Reusable code boundary

Application
    ↓
Executable/deployable process

Service
    ↓
Independently operated application capability
```

Initially:

```text
One Git repository
        │
        ├── packages
        │
        └── apps
```

Later:

```text
One package
        ↓
npm package
```

or:

```text
One application
        ↓
independently deployed service
```

Do not confuse these boundaries.

---

# 8. Initial Technology Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
OrchestrAI UI system
WebSocket
SSE
TanStack Query
```

## TypeScript platform

```text
Node.js
TypeScript
NestJS
LangChain.js
LangGraph.js
Zod
Prisma
BullMQ
Redis
```

## Python

Use Python deliberately for AI/ML-heavy workloads.

Potential areas:

```text
RAG experimentation
Embeddings
Reranking
Evaluation
ML
Data processing
```

Initial Python framework:

```text
FastAPI
Pydantic
```

Do not introduce Python merely because "AI uses Python."

---

# 9. Local-First Strategy

Initial model infrastructure:

```text
Ollama
   ↓
Qwen 8B
```

The platform should remain provider-independent.

Qwen is the initial model, not an architectural dependency.

---

# 10. Engineering Principles

Every implementation should follow:

## 10.1 Separation of Concerns

Do not create modules that simultaneously perform:

```text
HTTP
database
agent reasoning
authorization
queue
event publishing
```

Separate responsibilities.

---

# 11. Dependency Inversion

Domain/application logic should depend on abstractions.

Prefer:

```text
Application
    ↓
ModelProvider
    ↓
OllamaAdapter
```

instead of:

```text
Application
    ↓
Ollama SDK
```

This is the **Dependency Inversion Principle**.

---

# 12. Hexagonal Architecture

Where infrastructure boundaries matter:

```text
             Domain / Application
                     │
               Ports / Interfaces
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
     Ollama         Redis      PostgreSQL
     Adapter        Adapter      Adapter
```

Infrastructure should implement ports.

---

# 13. Clean Architecture

Where appropriate:

```text
Presentation
     ↓
Application
     ↓
Domain
     ↓
Infrastructure
```

Dependency direction should point inward.

---

# 14. Domain-Driven Design

Use DDD concepts where they provide real value.

Important concepts:

```text
Entity
Value Object
Aggregate
Domain Event
Repository
Application Service
Bounded Context
```

Do not force DDD terminology onto trivial utility code.

---

# 15. AI Coding Agent Operating Rules

Every AI coding agent working on this project MUST:

1. Read `ORCHESTRAI-IMPLEMENTATION.md`.
2. Read the current progress.
3. Inspect the repository.
4. Inspect the current implementation.
5. Identify the current phase.
6. Identify the current feature.
7. Check existing ADRs.
8. Avoid duplicating existing functionality.
9. Implement one coherent feature at a time.
10. Validate the implementation.
11. Explain architectural decisions.
12. Update this document.
13. Record the next continuation point.

---

# 16. Session Continuity

This project will be developed across many AI coding sessions.

Therefore:

> The repository itself must contain enough information for a new AI agent to continue from the exact point where the previous agent stopped.

Chat history must NOT be treated as the source of truth.

The source of truth is:

```text
ORCHESTRAI-IMPLEMENTATION.md
ARCHITECTURE.md
ADR documents
source code
tests
implementation logs
```

---

# 17. Mandatory Status Update

After EVERY meaningful feature implementation, update the status.

Use:

```text
[ ] Not Started
[~] In Progress
[x] Completed
[!] Blocked
[-] Deferred
```

A feature must not be marked `[x]` until validation is complete.

---

# 18. Required Completion Record

Every completed feature must record:

```text
### Feature Status

Status: [x]

Implementation:
- ...

Files:
- ...

Architecture:
- ...

Patterns:
- ...

Technologies:
- ...

Validation:
- Build:
- Typecheck:
- Lint:
- Tests:
- Manual verification:

Learning:
- ...

Interview concepts:
- ...

Known limitations:
- ...

Next:
- ...
```

---

# 19. Architecture Explanation Rule

Whenever an architectural pattern is introduced, the agent MUST explain:

```text
What is it?
Why do we need it?
What problem does it solve?
Where is it implemented?
What alternatives exist?
Why did we choose it?
What are the trade-offs?
What happens when it fails?
How does it scale?
```

---

# 20. Learning Documentation

Maintain:

```text
docs/learning/
```

Examples:

```text
dependency-inversion.md
hexagonal-architecture.md
clean-architecture.md
state-machines.md
llm-provider-pattern.md
tool-architecture.md
circuit-breaker.md
retry-pattern.md
bulkhead-pattern.md
queue-architecture.md
event-driven-architecture.md
websocket-vs-sse.md
database-indexing.md
transaction-isolation.md
distributed-tracing.md
rag-architecture.md
multi-agent-architecture.md
```

Each should include:

```text
Definition
Problem
Architecture
OrchestrAI usage
Alternatives
Trade-offs
Failure scenarios
Scaling considerations
Interview questions
Interview answer
```

---

# 21. Architecture Decision Records

Maintain:

```text
docs/adr/
```

Example:

```text
ADR-001-monorepo-first.md
ADR-002-package-boundaries.md
ADR-003-domain-contracts.md
ADR-004-model-provider-abstraction.md
ADR-005-tool-architecture.md
ADR-006-langgraph-runtime.md
ADR-007-redis-queue.md
ADR-008-event-driven-execution.md
ADR-009-websocket-and-sse.md
ADR-010-postgresql.md
ADR-011-observability.md
```

Each ADR:

```text
# Decision

## Context

## Problem

## Options

## Decision

## Why

## Trade-offs

## Consequences

## Reconsideration Criteria
```

---

# 22. PHASE 0 — Workspace & Engineering Foundation

Status: [x]

## Goal

Create the initial monorepo.

## Learn

```text
pnpm workspaces
Turborepo
package boundaries
workspace dependencies
TypeScript project references
CI/CD
code quality
```

## Implement

```text
apps/
packages/
infrastructure/
docs/
scripts/
```

Configure:

```text
Node.js
pnpm
TypeScript
ESLint
Prettier
Vitest
Turborepo
```

Use strict TypeScript.

Establish package naming:

```text
@orchestrai/*
```

Internally, workspace packages may use:

```text
workspace:*
```

until extraction.

## Deliverables

```text
README.md
ARCHITECTURE.md
AGENT.md
ORCHESTRAI-IMPLEMENTATION.md
```

---

# 23. PHASE 1 — `packages/core`

Status: [ ]

## Goal

Create the common contracts.

## Structure

```text
packages/core/
├── src/
│   ├── agents/
│   ├── executions/
│   ├── messages/
│   ├── models/
│   ├── tools/
│   ├── events/
│   ├── streaming/
│   ├── errors/
│   ├── identifiers/
│   └── types/
├── tests/
└── package.json
```

## Core concepts

```text
Agent
AgentExecution
ExecutionStep
ExecutionStatus
AIMessage
AIModel
AITool
ToolCall
ToolResult
AgentState
AgentEvent
StreamChunk
Approval
Memory
Workflow
```

## Learn

```text
Domain Modeling
Type-safe Contracts
Value Objects
Discriminated Unions
State Machines
Schema Validation
```

---

# 24. Execution State Machine

Use explicit lifecycle states:

```text
CREATED
   ↓
QUEUED
   ↓
RUNNING
   ↓
WAITING_FOR_APPROVAL
   ↓
RUNNING
   ↓
COMPLETED
```

Other terminal states:

```text
FAILED
CANCELLED
```

Avoid multiple independent booleans such as:

```text
isRunning
isPaused
isCompleted
hasError
```

because they can create invalid combinations.

---

# 25. PHASE 2 — `packages/models`

Status: [ ]

## Goal

Create a model-provider abstraction.

## Structure

```text
packages/models/
├── src/
│   ├── providers/
│   │   └── ollama/
│   ├── routing/
│   ├── streaming/
│   ├── structured/
│   ├── policies/
│   ├── errors/
│   └── index.ts
└── package.json
```

## Initial provider

```text
Ollama
   ↓
Qwen 8B
```

## API

```text
generate()
stream()
structuredOutput()
```

## Learn

```text
Adapter Pattern
Strategy Pattern
Provider Abstraction
Streaming
Structured Output
Tool Calling
```

---

# 26. Model Resilience

All external model calls must eventually support:

```text
Timeout
Retry
Exponential Backoff
Jitter
Circuit Breaker
```

## Circuit Breaker

States:

```text
CLOSED
   ↓ repeated failures
OPEN
   ↓ cooldown
HALF_OPEN
   ↓ success
CLOSED
```

Explain:

> Circuit Breaker prevents repeatedly calling an unhealthy dependency and allows the application to fail fast.

Do not confuse it with retry.

Retry attempts recovery.

Circuit breaker prevents repeated calls to a dependency that is already unhealthy.

---

# 27. PHASE 3 — `packages/tools`

Status: [ ]

## Goal

Create the tool framework.

## Structure

```text
packages/tools/
├── src/
│   ├── registry/
│   ├── resolver/
│   ├── authorization/
│   ├── validation/
│   ├── execution/
│   ├── policies/
│   ├── built-in/
│   │   ├── calculator/
│   │   ├── datetime/
│   │   ├── http/
│   │   ├── filesystem/
│   │   └── search/
│   └── index.ts
└── package.json
```

## Contract

```ts
interface AITool {
  name: string;
  description: string;
  inputSchema: ZodSchema;
  permissions: ToolPermission[];
  execute(
    context: ToolExecutionContext,
    input: unknown
  ): Promise<ToolResult>;
}
```

---

# 28. Tool Security

The LLM does NOT directly control permissions.

Correct:

```text
LLM
 ↓
Proposed Tool Call
 ↓
Validation
 ↓
Authorization
 ↓
Policy Check
 ↓
Tool
```

Never:

```text
LLM
 ↓
Unlimited System Access
```

---

# 29. Tool Permission Model

Initially classify tools:

```text
READ
WRITE
DESTRUCTIVE
PRIVILEGED
```

Examples:

```text
Read file       → READ
Write file      → WRITE
Delete file     → DESTRUCTIVE
Execute shell   → PRIVILEGED
```

This becomes the foundation for agent safety.

---

# 30. PHASE 4 — `packages/agent`

Status: [ ]

## Goal

Build the first agent abstraction.

The first version should remain intentionally simple.

```text
User
 ↓
Agent
 ↓
Model
 ↓
Tool
 ↓
Observation
 ↓
Response
```

## Learn

```text
Agent Loop
Planning
Action Selection
Observation
Stopping Conditions
Context Construction
Tool Calling
```

---

# 31. Agent Safety Limits

Every execution must have configurable limits:

```text
maxIterations
maxExecutionTime
maxToolCalls
maxTokens
allowedTools
```

The agent must not be allowed to execute unlimited loops.

---

# 32. PHASE 5 — `packages/runtime`

Status: [ ]

## Goal

Create the execution runtime.

Important distinction:

```text
Agent
    =
Agent behavior / definition

Runtime
    =
Execution engine
```

The runtime executes an agent.

---

# 33. LangGraph

Use LangGraph.js for stateful execution.

Example:

```text
Understand
    ↓
Plan
    ↓
Select Action
    ↓
Execute
    ↓
Observe
    ↓
Decision
  ↙     ↘
Continue Finish
```

Learn:

```text
Graph
Node
Edge
State
Conditional Routing
Checkpoint
Interrupt
Subgraph
Human-in-the-loop
```

---

# 34. PHASE 6 — Database Architecture

Status: [ ]

## Goal

Create the persistence foundation.

Use:

```text
PostgreSQL
Prisma
Raw SQL where appropriate
```

Initially one PostgreSQL cluster/database is enough.

Do NOT prematurely create separate databases for every component.

---

# 35. Initial Database Domains

Logical domains:

```text
agents
executions
conversations
messages
tool_calls
approvals
events
memory
documents
chunks
```

Depending on scale, use schemas later:

```text
public
memory
rag
```

Do not create database boundaries simply because application folders exist.

---

# 36. Database Design Principles

Every important table should consider:

```text
Primary Key
Foreign Keys
Unique Constraints
Check Constraints
Indexes
Timestamps
Soft-delete strategy where required
Audit information where required
```

Database invariants should be enforced at the database level.

Do not rely exclusively on application validation.

---

# 37. PostgreSQL Learning Requirements

The project must deliberately use and teach:

```text
B-tree indexes
Composite indexes
Partial indexes
GIN indexes
JSONB
CTEs
Recursive CTEs
Window Functions
UPSERT
Transactions
Locks
EXPLAIN
EXPLAIN ANALYZE
Materialized Views
Full-text search
Connection pooling
```

For complex queries explain:

```text
Why this query?
Why this index?
What is the query plan?
What happens at scale?
```

---

# 38. Transactions

Learn ACID:

```text
Atomicity
Consistency
Isolation
Durability
```

Understand:

```text
Read Committed
Repeatable Read
Serializable
```

and:

```text
Optimistic Concurrency
Pessimistic Concurrency
SELECT FOR UPDATE
```

Use transactions where multiple writes must remain consistent.

---

# 39. PHASE 7 — `packages/queue`

Status: [ ]

## Goal

Create queue abstractions.

Use:

```text
BullMQ
Redis
```

The package should abstract queue infrastructure from application code.

Architecture:

```text
Producer
   ↓
Queue
   ↓
Consumer
```

---

# 40. Queue Reliability

Implement:

```text
Retry
Exponential Backoff
Jitter
Timeout
Concurrency
Priority
Cancellation
Idempotency
Dead Letter handling
Graceful Shutdown
```

Learn:

```text
Producer-Consumer Pattern
Work Queue
Backpressure
At-least-once Processing
Idempotent Consumer
```

---

# 41. PHASE 8 — `apps/worker`

Status: [ ]

## Goal

Create the actual worker process.

Structure:

```text
apps/worker/
├── src/
│   ├── jobs/
│   │   ├── agent/
│   │   ├── document/
│   │   ├── evaluation/
│   │   └── maintenance/
│   ├── processors/
│   ├── workers/
│   └── bootstrap/
└── package.json
```

Worker:

```text
Queue
 ↓
Worker
 ↓
Runtime
 ↓
Agent
```

---

# 42. Why Worker Is Separate

The HTTP API should not perform long-running agent execution.

Instead:

```text
POST /executions
        ↓
Create execution
        ↓
Queue job
        ↓
Return executionId
```

Then:

```text
Worker
 ↓
Execute agent
```

This is **asynchronous processing**.

It prevents long AI tasks from blocking normal API operations.

---

# 43. PHASE 9 — Event Architecture

Status: [ ]

## Goal

Introduce domain events.

Initial technology:

```text
Redis Streams
```

Later:

```text
Kafka
```

---

# 44. Commands vs Events

This distinction must remain explicit.

```text
Command
    =
"Please do this."

Event
    =
"This already happened."
```

Example:

```text
ExecuteAgentCommand
        ↓
Queue
```

versus:

```text
AgentCompleted
        ↓
Event Stream
```

---

# 45. Event Envelope

Every event should have:

```text
eventId
eventType
eventVersion
timestamp
source
correlationId
causationId
aggregateId
payload
metadata
```

This teaches:

```text
Event Versioning
Correlation
Causation
Event Traceability
```

---

# 46. Initial Events

```text
AgentStarted
AgentPlanning
ModelStarted
ModelCompleted
ToolStarted
ToolCompleted
ApprovalRequested
ApprovalGranted
AgentPaused
AgentResumed
AgentCompleted
AgentFailed
```

---

# 47. Event Consumers

Events should eventually support:

```text
Realtime
Observability
Persistence
Analytics
Evaluation
Notifications
```

This is the foundation of **Event-Driven Architecture**.

---

# 48. PHASE 10 — Persistence + Execution Recovery

Status: [ ]

Persist:

```text
executions
messages
tool_calls
approvals
checkpoints
events
```

Execution:

```text
RUNNING
 ↓
Process failure
 ↓
Persisted state
 ↓
Resume / Recover
```

Learn:

```text
Durability
Checkpointing
Recovery
Idempotency
Failure Recovery
```

---

# 49. PHASE 11 — Human-in-the-Loop

Status: [ ]

Example:

```text
Agent
 ↓
Dangerous Action
 ↓
WAITING_FOR_APPROVAL
 ↓
User
 ↓
Approve
 ↓
Resume
```

Example UI:

```text
Delete 400 files?

[Approve] [Reject]
```

Approval must be represented as an explicit state transition.

---

# 50. PHASE 12 — `apps/realtime`

Status: [ ]

Realtime is initially an **application/service inside the monorepo**, not a separate Git repository.

## Purpose

Deliver execution updates to the Console.

Use:

```text
WebSocket
SSE
Redis
Event Streams
```

Architecture:

```text
Worker
 ↓
Events
 ↓
Realtime
 ↓
WebSocket / SSE
 ↓
Console
```

---

# 51. Realtime Package Boundary

Shared protocol/contracts should live in:

```text
packages/core
```

or a dedicated shared realtime package if it becomes necessary.

The executable server lives in:

```text
apps/realtime
```

This prevents transport implementation from leaking into the domain.

---

# 52. WebSocket Learning

Implement:

```text
Connection
Authentication
Authorization
Subscriptions
Rooms
Heartbeat
Disconnect
Reconnect
Presence
Connection limits
Rate limiting
```

Then run multiple realtime instances:

```text
Realtime #1
Realtime #2
```

using Redis for cross-instance communication.

This teaches **horizontal realtime scaling**.

---

# 53. WebSocket vs SSE

Learn both.

## WebSocket

Good for:

```text
Bidirectional communication
Approvals
Cancellation
Interactive execution
Presence
```

## SSE

Good for:

```text
Server → Client streaming
Execution updates
Simpler streaming
```

Do not treat one as universally better.

Document the trade-offs.

---

# 54. PHASE 13 — `apps/console`

Status: [ ]

The current OrchestrAI UI belongs here.

```text
apps/console/
```

The Console should consume the platform through APIs and realtime protocols.

It should NOT contain agent business logic.

---

# 55. Console Architecture

Recommended:

```text
apps/console/
├── app/
├── src/
│   ├── features/
│   │   ├── home/
│   │   ├── agents/
│   │   ├── console/
│   │   ├── conversations/
│   │   ├── executions/
│   │   ├── memory/
│   │   ├── knowledge/
│   │   ├── tools/
│   │   ├── models/
│   │   ├── workflows/
│   │   ├── events/
│   │   ├── evaluations/
│   │   ├── activity/
│   │   └── settings/
│   ├── components/
│   ├── hooks/
│   ├── providers/
│   ├── lib/
│   └── types/
└── package.json
```

---

# 56. Console Execution Experience

The Console should feel like an active execution environment rather than a traditional chat application.

Show operational activities such as:

```text
Understanding request
Planning execution
Selecting tool
Searching web
Reading file
Calling model
Executing database query
Waiting for approval
Resuming execution
Completed
```

Completed activities should collapse automatically.

Users can expand them to see operational details.

Do not expose private chain-of-thought.

---

# 57. UI Design Principle

The execution UI should visually communicate:

```text
Activity
State
Relationships
Progress
Dependencies
Human intervention
```

The design can use:

* execution topology
* agent relationships
* activity signals
* contextual data
* active execution states

Do not literally use robots, neurons, or decorative AI graphics unless they improve the actual experience.

---

# 58. PHASE 14 — Agent Modes

Status: [ ]

Implement:

```text
CHAT
PLAN
ACT
AUTO
```

## CHAT

No side effects.

## PLAN

Read-only tools allowed.

## ACT

Mutation tools allowed according to authorization.

## AUTO

Application-controlled routing selects the appropriate mode.

Important:

> The LLM proposes behavior; the application enforces permissions and mode constraints.

---

# 59. PHASE 15 — `packages/memory`

Status: [ ]

Initially keep memory inside the monorepo.

Do not immediately make it a separate Python service.

## Goal

Implement controlled memory.

Start:

```text
Conversation Memory
```

Then:

```text
Working Memory
```

Then:

```text
Long-Term Memory
```

Then:

```text
Semantic Memory
```

---

# 60. Memory Types

Use explicit types:

```text
CONVERSATION
WORKING
USER_PREFERENCE
FACT
EPISODIC
TASK
SYSTEM
```

Do not automatically store everything.

Memory requires:

```text
Relevance
Privacy
Retention
Lifecycle
Retrieval
```

---

# 61. PHASE 16 — RAG

Status: [ ]

Initially keep RAG in:

```text
packages/rag
```

If AI/ML workloads later justify Python extraction:

```text
apps/rag
```

can become a Python service.

This is deliberate **evolutionary architecture**.

---

# 62. RAG Pipeline

```text
Document
 ↓
Ingestion
 ↓
Extraction
 ↓
Chunking
 ↓
Embedding
 ↓
Storage
 ↓
Retrieval
 ↓
Reranking
 ↓
Context
 ↓
Agent
```

Use:

```text
PostgreSQL
pgvector
Ollama embeddings
```

Initially.

---

# 63. RAG Learning

Learn:

```text
Chunking
Embeddings
Vector Search
Metadata Filtering
Hybrid Search
Reranking
Context Construction
Citations
Retrieval Evaluation
```

Later experiment with:

```text
Qdrant
Hugging Face
Cross-Encoder
```

only when there is a concrete reason.

---

# 64. PHASE 17 — Gateway

Status: [ ]

Create:

```text
apps/gateway
```

## Purpose

Public API boundary.

Responsibilities:

```text
Authentication
Authorization
Request Validation
Execution Creation
Conversation APIs
Agent APIs
Rate Limiting
API Versioning
```

It must not contain core agent execution logic.

---

# 65. Gateway Architecture

```text
Client
 ↓
Gateway
 ↓
Application Services
 ↓
Queue / Runtime / Data
```

This is the **API Boundary Pattern**.

---

# 66. PHASE 18 — `packages/sdk`

Status: [ ]

Create:

```text
packages/sdk
```

Eventually publish as:

```text
@orchestrai/sdk
```

FinAI should consume OrchestrAI through this SDK.

Example:

```ts
const execution = await orchestrai.agents.run({
  agent: "finance",
  mode: "auto",
  input: "Analyze my spending"
});
```

Streaming:

```ts
for await (const event of execution.stream()) {
  // handle event
}
```

The SDK should hide internal implementation details.

---

# 67. SDK Design

Learn:

```text
API Client Design
Versioning
Typed Contracts
Error Normalization
Streaming APIs
Authentication
Retry
Idempotency
Backward Compatibility
Semantic Versioning
```

---

# 68. PHASE 19 — Observability

Status: [ ]

Initially create:

```text
packages/observability
```

This should provide a shared observability SDK.

Infrastructure lives separately:

```text
infrastructure/monitoring/
```

This is an important correction from the original architecture.

Do not mix:

```text
instrumentation library
```

with:

```text
Prometheus/Grafana deployment
```

---

# 69. Observability Package

Provide:

```text
Tracing
Logging
Metrics
Correlation Context
Instrumentation
Error Context
```

Use:

```text
OpenTelemetry
```

---

# 70. Observability Infrastructure

Initially:

```text
Prometheus
Grafana
OpenTelemetry Collector where needed
```

Infrastructure configuration belongs under:

```text
infrastructure/monitoring/
```

---

# 71. Distributed Trace

A single execution should eventually be traceable:

```text
HTTP Request
 ↓
Gateway
 ↓
Queue
 ↓
Worker
 ↓
Runtime
 ↓
LangGraph
 ↓
Model
 ↓
Tool
 ↓
PostgreSQL
```

Example:

```text
Execution: exec_123

Gateway             15ms
Queue                 8ms
Planner             120ms
LLM                1.8s
Web Search          640ms
Postgres             40ms
Total              2.62s
```

---

# 72. Metrics

Agent:

```text
agent_executions_total
agent_execution_duration
agent_failures_total
active_executions
```

LLM:

```text
llm_requests_total
llm_duration
llm_errors_total
input_tokens
output_tokens
```

Tools:

```text
tool_calls_total
tool_duration
tool_failures_total
```

Queue:

```text
queue_depth
job_duration
job_failures
```

Realtime:

```text
active_connections
messages_total
disconnects_total
message_latency
```

---

# 73. Structured Logging

Example:

```json
{
  "level": "info",
  "event": "tool.completed",
  "executionId": "exec_123",
  "tool": "web.search",
  "durationMs": 640
}
```

Use:

```text
traceId
spanId
correlationId
executionId
userId
service
```

where appropriate and safe.

Never log:

```text
passwords
tokens
API keys
secrets
sensitive user data
```

---

# 74. PHASE 20 — Reliability Engineering

Status: [ ]

Reliability is not one phase that happens once.

It must be applied continuously.

Every external dependency should be evaluated for:

```text
Timeout
Retry
Backoff
Jitter
Circuit Breaker
Bulkhead
Rate Limit
Idempotency
Health Check
Graceful Shutdown
```

---

# 75. Timeout Pattern

Every network dependency must have a bounded timeout.

Examples:

```text
LLM request
HTTP request
Database query
Redis command
RAG request
Queue operation
```

Never allow an external dependency to hang indefinitely.

---

# 76. Retry Pattern

Retry only transient failures.

Retry candidates:

```text
temporary network failure
temporary service unavailable
connection reset
rate limit when appropriate
```

Do NOT blindly retry:

```text
validation error
authentication failure
authorization failure
invalid request
non-idempotent side effect
```

---

# 77. Exponential Backoff

Example:

```text
100ms
200ms
400ms
800ms
```

with jitter.

Explain why jitter is necessary to avoid synchronized retry storms.

---

# 78. Circuit Breaker

Use:

```text
CLOSED
OPEN
HALF_OPEN
```

Circuit breaker should prevent cascading failures.

Example:

```text
Ollama unhealthy
      ↓
Failures increase
      ↓
Circuit opens
      ↓
Fail fast
      ↓
Cooldown
      ↓
Half-open probe
      ↓
Recovery
```

---

# 79. Bulkhead Pattern

Isolate resources.

Example:

```text
LLM concurrency       = 4
Web tools             = 10
Database operations   = 20
```

One dependency must not consume all worker capacity.

This teaches:

> Failure isolation through resource partitioning.

---

# 80. PHASE 21 — Security

Status: [ ]

Security is continuous, but perform a dedicated security review.

Learn:

```text
Authentication
Authorization
RBAC
ABAC
Capability Security
Secrets Management
SSRF
Injection
Prompt Injection
Tool Abuse
Sandboxing
Rate Limiting
Audit Logging
```

---

# 81. Agent Security Boundary

Correct:

```text
LLM
 ↓
Proposed Action
 ↓
Schema Validation
 ↓
Authorization
 ↓
Policy
 ↓
Tool
```

Never:

```text
LLM
 ↓
Unlimited Access
```

---

# 82. High-Risk Operations

Potentially require approval:

```text
Delete
Write
Financial transaction
External communication
Credential access
Code execution
Production infrastructure
```

The application must determine whether approval is required.

Do not let the LLM make the final security decision.

---

# 83. PHASE 22 — Distributed Consistency

Status: [ ]

Learn:

```text
Strong Consistency
Eventual Consistency
Distributed Transactions
Idempotency
Outbox Pattern
Saga Pattern
Compensating Actions
```

---

# 84. Outbox Pattern

When database state and event publication must be consistent:

```text
Database Transaction
 ├── Update domain state
 └── Insert outbox event

Commit
 ↓
Outbox Publisher
 ↓
Event Bus
```

This avoids the failure case:

```text
Database update succeeds
Event publishing fails
```

---

# 85. Saga Pattern

For long-running distributed workflows:

```text
Step A
 ↓
Step B
 ↓
Step C
```

If C fails:

```text
Compensation
 ↓
Undo/reconcile previous operations
```

Use only where distributed workflow complexity actually requires it.

---

# 86. PHASE 23 — Advanced PostgreSQL

Status: [ ]

Build real examples using:

```text
CTEs
Recursive CTEs
Window Functions
JSONB
GIN
Partial Indexes
Composite Indexes
Full-text Search
UPSERT
Locks
Materialized Views
EXPLAIN ANALYZE
```

Document performance characteristics.

---

# 87. PHASE 24 — Caching

Status: [ ]

Redis may eventually provide:

```text
Cache
Pub/Sub
Streams
BullMQ backend
Rate limiting
Distributed locks
Sessions
Temporary state
```

Learn:

```text
Cache Aside
TTL
Invalidation
Cache Stampede
Distributed Locking
```

Do not cache everything.

---

# 88. PHASE 25 — Performance Engineering

Status: [ ]

Measure before optimizing.

Learn:

```text
Latency
Throughput
Concurrency
CPU
Memory
I/O
Connection Pooling
Queue Depth
Backpressure
Cache Hit Ratio
```

Track:

```text
p50
p95
p99
```

Do not rely solely on averages.

---

# 89. PHASE 26 — Evaluation

Status: [ ]

Create:

```text
packages/eval
```

Initially it may use TypeScript for orchestration while Python tooling is introduced where it provides clear AI/ML value.

Later it may become:

```text
apps/eval
```

if extraction becomes justified.

---

# 90. Evaluation Dataset

Create:

```text
datasets/
├── general/
├── coding/
├── research/
├── tool-calling/
├── rag/
└── finance/
```

Example:

```text
100 user requests
        ↓
Agent
        ↓
Evaluation
```

Measure:

```text
Intent accuracy
Tool selection
Tool arguments
Final answer
RAG retrieval
Latency
Token usage
Failure rate
```

---

# 91. Regression Evaluation

Example:

```text
Agent v1 → 82%
Agent v2 → 87%
Agent v3 → 84%
```

v3 represents a regression.

Agent quality should be measured scientifically rather than judged only through manual interaction.

---

# 92. PHASE 27 — Research Agent

Status: [ ]

Build the first serious specialist agent.

Capabilities:

```text
Search
Fetch
Read
RAG
Citations
Synthesis
```

Graph:

```text
Question
 ↓
Plan
 ↓
Search
 ↓
Read
 ↓
Analyze
 ↓
Identify gaps
 ↓
Search again
 ↓
Synthesize
```

This becomes a major LangGraph learning project.

---

# 93. PHASE 28 — Developer Agent

Status: [ ]

Build:

```text
Developer Agent
```

Potential tools:

```text
Git
Filesystem
Shell
Docker
Postgres
Search
```

Workflow:

```text
Request
 ↓
Understand
 ↓
Inspect
 ↓
Plan
 ↓
Approval
 ↓
Modify
 ↓
Test
 ↓
Review
 ↓
Complete
```

Strong security controls are mandatory.

---

# 94. PHASE 29 — Multi-Agent Architecture

Status: [ ]

Only begin after single-agent execution is reliable.

Use:

```text
Supervisor
Planner / Executor
Specialist Delegation
Parallel Fan-out
Fan-in
```

Example:

```text
                    Supervisor
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Research        Developer       Data
       Agent            Agent         Agent
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                      Synthesis
```

Learn:

```text
Subgraphs
Delegation
Parallelism
Shared State
Failure Isolation
Agent-to-Agent Communication
```

---

# 95. PHASE 30 — Communication Evolution

Status: [ ]

Start with:

```text
HTTP
```

Then:

```text
Redis Streams / Queue
```

Only later introduce:

```text
gRPC
```

when there is a meaningful requirement.

---

# 96. gRPC Learning

Learn:

```text
Protocol Buffers
Strongly Typed Contracts
Unary RPC
Streaming RPC
Deadlines
Interceptors
Service Contracts
```

Compare:

```text
REST
vs
gRPC
```

Document when each should be used.

---

# 97. PHASE 31 — Kafka

Status: [ ]

Only after Redis Streams is understood.

First:

```text
Producer
 ↓
Redis Streams
 ↓
Consumer
```

Then recreate the concept using Kafka:

```text
Producer
 ↓
Kafka
 ↓
Consumer Group
```

Learn:

```text
Partitions
Offsets
Consumer Groups
Ordering
Retention
Replay
Delivery Semantics
Partition Strategy
```

Then document:

```text
Redis Streams
vs
Kafka
```

Do not introduce Kafka merely because it is an industry-standard technology.

---

# 98. PHASE 32 — Distributed Execution

Status: [ ]

Run multiple instances:

```text
Gateway × 2
Realtime × 2
Worker × 5
RAG × 2
```

The goal is to understand what happens when the system becomes distributed.

Test:

```text
Redis dies
Worker dies
Model hangs
WebSocket disconnects
Duplicate job occurs
Event arrives twice
Event arrives late
Postgres becomes slow
User approves after timeout
```

For each scenario document:

```text
Failure
Detection
Impact
Recovery
Data consistency
User experience
Observability
```

---

# 99. PHASE 33 — Production Infrastructure

Status: [ ]

Start with:

```text
Docker
Docker Compose
Nginx
```

Infrastructure:

```text
PostgreSQL
Redis
Ollama
Prometheus
Grafana
```

Eventually:

```text
Load Balancer
Gateway
Workers
Realtime
Runtime
Redis
PostgreSQL
Object Storage
Monitoring
```

---

# 100. PHASE 34 — Kubernetes

Status: [ ]

Do not start Kubernetes early.

First understand Docker Compose and distributed deployment.

Learn:

```text
Pod
Deployment
Service
Ingress
ConfigMap
Secret
HPA
Readiness Probe
Liveness Probe
Persistent Volume
StatefulSet
```

Understand the difference between:

```text
Stateless Services
Stateful Services
```

---

# 101. PHASE 35 — Architecture Review

Status: [ ]

Perform a complete architecture review.

Review:

```text
Domain Boundaries
Package Boundaries
Application Boundaries
Data Ownership
API Contracts
Event Contracts
Queue Architecture
Failure Modes
Security
Scalability
Observability
Performance
Deployment
Disaster Recovery
Cost
Developer Experience
```

Create:

```text
docs/architecture/ARCHITECTURE-REVIEW.md
```

---

# 102. FinAI Integration

Status: [ ]

FinAI becomes the first real external consumer.

Architecture:

```text
FinAI
  │
  ▼
@orchestrai/sdk
  │
  ▼
OrchestrAI Gateway
  │
  ▼
Finance Agent
```

FinAI-specific tools remain in FinAI.

Examples:

```text
createTransaction()
getAccounts()
analyzeSpending()
createBudget()
```

OrchestrAI provides:

```text
Agent
Planning
Execution
Memory
Streaming
Events
Tool orchestration
Evaluation
Observability
```

This separation is critical.

---

# 103. Future Applications

Eventually:

```text
                     OrchestrAI
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
        FinAI          Application 2     Application 3
          │               │                │
          ↓               ↓                ↓
    Finance Agent    Research Agent    Personal Agent
```

AI infrastructure should not be rebuilt for every application.

---

# 104. Package Extraction Strategy

When a package becomes stable, extract it.

Potential candidates:

```text
@orchestrai/core
@orchestrai/models
@orchestrai/tools
@orchestrai/agent
@orchestrai/events
@orchestrai/queue
@orchestrai/sdk
@orchestrai/observability
```

Extraction criteria:

```text
Stable public API
Multiple consumers
Clear ownership
Independent release cadence
Low internal coupling
Meaningful reuse
```

---

# 105. Service Extraction Strategy

Only extract a service when there is a real reason such as:

```text
Independent scaling
Independent deployment
Different runtime requirements
Different language requirements
Failure isolation
Team ownership
Security isolation
Resource isolation
```

Do not extract merely because a folder became large.

---

# 106. Polyglot Architecture

Initial:

```text
                 OrchestrAI
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
     TypeScript              Python
```

TypeScript:

```text
Gateway
Agent
Runtime
Tools
Queue
Worker
Events
Realtime
SDK
Console
```

Python where justified:

```text
RAG
Embeddings
Reranking
Evaluation
ML
Data processing
AI experimentation
```

This is a:

> Purposeful Polyglot Architecture.

---

# 107. Python Service Extraction

Do not immediately create:

```text
orchestrai-memory Python service
orchestrai-rag Python service
```

Instead:

```text
packages/memory
packages/rag
```

first.

When Python-specific workloads become significant:

```text
apps/memory
apps/rag
```

can be introduced.

This gives the architecture an evolutionary path:

```text
Package
 ↓
Internal Application
 ↓
Service
```

---

# 108. API Architecture

Every API must define:

```text
Request
Response
Errors
Authentication
Authorization
Validation
Timeout
Idempotency
Rate Limit
Version
```

Use OpenAPI.

---

# 109. Idempotency

For operations with side effects, support idempotency where appropriate.

Example:

```text
POST /executions
Idempotency-Key: abc123
```

If the same request arrives twice:

```text
Request 1 → execution_123
Request 2 → execution_123
```

rather than:

```text
execution_123
execution_124
```

This is important in distributed systems because retries and duplicate delivery are normal possibilities.

---

# 110. Graceful Shutdown

Every application should handle shutdown.

For workers:

```text
Stop accepting new jobs
 ↓
Finish safe active work
 ↓
Persist state
 ↓
Release resources
 ↓
Exit
```

For realtime:

```text
Stop accepting connections
 ↓
Notify clients if appropriate
 ↓
Close connections
 ↓
Release resources
```

---

# 111. Health Architecture

Provide:

```text
Liveness
Readiness
Dependency Health
```

Liveness answers:

> Is this process alive?

Readiness answers:

> Can this process currently receive traffic?

Do not make liveness checks depend on every external dependency.

---

# 112. Rate Limiting

Apply rate limits to:

```text
Public APIs
LLM requests
Expensive tools
Web search
Code execution
Realtime connections
```

Use Redis when distributed rate limiting becomes necessary.

---

# 113. Backpressure

The system must not accept unlimited work.

Example:

```text
Requests
   ↓
Queue
   ↓
Workers
```

If:

```text
Queue depth = extremely high
```

the system should have a strategy:

```text
Rate limit
Reject
Delay
Prioritize
Scale workers
```

This is **Backpressure**.

---

# 114. Cancellation

Agent execution must support cancellation.

Flow:

```text
User
 ↓
Cancel
 ↓
Gateway
 ↓
Execution cancellation
 ↓
Worker
 ↓
Runtime
 ↓
Tool / model cancellation
```

Cancellation should be cooperative where hard interruption is unsafe.

---

# 115. Priority

Not all jobs have equal importance.

Potential priorities:

```text
CRITICAL
HIGH
NORMAL
LOW
BACKGROUND
```

The queue architecture should support priority where justified.

---

# 116. Execution Cost Controls

AI execution can consume significant resources.

Track:

```text
Token usage
Model duration
Tool duration
Execution duration
Number of iterations
Number of tool calls
Queue wait time
```

Potential limits:

```text
maxTokens
maxToolCalls
maxExecutionTime
maxCost
```

---

# 117. Agent Context Management

Do not blindly send the entire history to the model.

Build context intentionally.

Potential layers:

```text
System Context
Agent Instructions
Current Conversation
Relevant Memory
RAG Context
Tool Results
Current Execution State
```

The context builder should be deterministic and observable.

---

# 118. Prompt Injection Defense

RAG and tool-enabled agents must assume retrieved content may contain malicious instructions.

Treat retrieved content as:

```text
Untrusted Data
```

not:

```text
Trusted Instructions
```

The application should distinguish:

```text
System instructions
Developer instructions
User instructions
Retrieved content
Tool output
External content
```

---

# 119. Tool Output Safety

Tool results should be bounded.

Potential controls:

```text
Maximum output size
Sanitization
Schema validation
Timeout
Redaction
Sensitive data filtering
```

Do not blindly inject huge tool outputs into the model context.

---

# 120. File / Shell / Browser Security

High-risk tools must have stronger isolation.

Potential future architecture:

```text
Agent
 ↓
Sandbox
 ↓
Tool
```

Do not execute arbitrary user/model-generated shell commands directly on the host system.

---

# 121. Data Privacy

Do not put sensitive data into:

```text
logs
metrics labels
traces
event metadata
error messages
```

without explicit justification.

Observability systems can become secondary data stores.

---

# 122. Logging Levels

Use:

```text
DEBUG
INFO
WARN
ERROR
```

Do not use DEBUG-level data as the only source of operationally important information.

---

# 123. Metrics Cardinality

Avoid high-cardinality labels such as:

```text
userId
executionId
raw URL
prompt
```

in Prometheus labels.

Those values belong in traces/logs where appropriate.

This should be explicitly taught as a Prometheus architecture consideration.

---

# 124. Distributed Tracing

Trace propagation should use:

```text
Trace ID
Span ID
Context propagation
```

Across:

```text
Gateway
Queue
Worker
Runtime
LLM
Tools
Database
Redis
RAG
Realtime
```

Where asynchronous boundaries make standard propagation insufficient, use explicit correlation metadata.

---

# 125. Event Ordering

Do not assume global event ordering in a distributed system.

If ordering matters, define the ordering boundary.

For example:

```text
executionId
sequenceNumber
```

may be used for execution-specific ordering.

---

# 126. Event Delivery

Assume events can potentially be:

```text
duplicated
delayed
retried
replayed
```

Consumers should therefore be idempotent where appropriate.

---

# 127. Event Versioning

Never casually change an event payload used by consumers.

Prefer:

```text
eventType
eventVersion
```

Example:

```text
AgentCompleted.v1
AgentCompleted.v2
```

Maintain compatibility during migrations.

---

# 128. Queue Delivery Semantics

Understand:

```text
At-most-once
At-least-once
Effectively-once
```

Do not claim "exactly once" without explaining what exactly is guaranteed and at which boundary.

---

# 129. Database and Queue Consistency

Study the failure:

```text
Database commit succeeds
Queue publish fails
```

and:

```text
Queue publish succeeds
Database commit fails
```

This is why patterns such as:

```text
Outbox
Inbox
Idempotency
```

matter.

---

# 130. Caching Strategy

Default strategy:

```text
Cache Aside
```

Flow:

```text
Application
 ↓
Cache
 ├── hit → return
 └── miss
       ↓
    Database
       ↓
    Cache
       ↓
    Return
```

Document invalidation rules.

---

# 131. Distributed Locking

Use Redis locks only where required.

Every lock must define:

```text
Owner
TTL
Renewal
Release
Failure behavior
```

Never assume a lock is permanent.

---

# 132. Architecture Trade-Off Rule

For every major decision, document:

```text
Option A
Option B
Option C

Chosen:
Reason:

Advantages:
Disadvantages:

Future trigger for changing:
```

This is essential for architect-level thinking.

---

# 133. Testing Strategy

Use multiple testing levels:

```text
Unit
Integration
Contract
Database
API
Queue
Event
Realtime
Agent Evaluation
Load
Security
```

Do not optimize for coverage percentage alone.

Optimize for confidence.

---

# 134. Testing Pyramid

Prefer:

```text
          E2E
        /     \
   Integration
     /       \
   Unit Tests
```

Most deterministic logic should be tested at lower levels.

---

# 135. Agent Testing

Agent systems require more than traditional unit tests.

Test:

```text
Tool Selection
Tool Arguments
State Transitions
Maximum Iterations
Timeout
Cancellation
Approval
Recovery
Prompt Injection
Malformed Model Output
Tool Failure
Model Failure
```

---

# 136. Architecture Test

Use automated checks where useful to enforce package boundaries.

Example:

```text
packages/core
    MUST NOT import
        Redis
        Prisma
        NestJS
        Ollama
```

This prevents architecture erosion.

---

# 137. Dependency Graph

Maintain a conceptual dependency direction:

```text
core
 ↑
models
 ↑
tools
 ↑
agent
 ↑
runtime
 ↑
worker
```

Infrastructure should implement boundaries rather than leaking into domain code.

---

# 138. Initial Dependency Graph

```text
                    core
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       models      tools      events
          │          │          │
          └──────────┼──────────┘
                     ↓
                   agent
                     ↓
                  runtime
                     ↓
                   worker
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
        queue                events
          │                     │
          └──────────┬──────────┘
                     ↓
                  realtime
                     ↓
                   console
```

---

# 139. Runtime Dependency Direction

The runtime can depend on:

```text
core
models
tools
events
memory
rag
```

but those packages should not depend on the runtime.

---

# 140. Gateway Dependency Direction

Gateway can depend on:

```text
core
sdk contracts
runtime/application interfaces
queue
events
auth infrastructure
```

But gateway should not contain:

```text
LangGraph implementation
business-domain logic
raw tool implementation
```

unless there is a deliberate boundary decision.

---

# 141. Worker Dependency Direction

Worker:

```text
queue
runtime
observability
events
```

Worker should be an execution host, not a domain model.

---

# 142. Realtime Dependency Direction

Realtime:

```text
events
core contracts
observability
Redis adapter
WebSocket/SSE infrastructure
```

Realtime does not execute agents.

---

# 143. Observability Dependency Direction

Observability should be usable by all applications.

It must avoid creating application-level circular dependencies.

```text
gateway ──────┐
worker ───────┤
runtime ──────┤
realtime ─────┤
tools ────────┤
              ↓
       observability
```

Not:

```text
observability
      ↓
runtime
      ↓
observability
```

---

# 144. Shared UI

The Console may eventually contain:

```text
packages/ui
```

inside the workspace.

Generic UI components belong there.

OrchestrAI-specific execution components remain in:

```text
apps/console
```

Examples:

```text
Button
Dialog
Tabs
Card
Input
Table
```

can be shared.

But:

```text
AgentExecutionRunner
ExecutionGraph
ToolRunner
ApprovalRunner
```

belong to the Console feature layer unless proven reusable.

---

# 145. Design System

The Console should use the established OrchestrAI visual direction.

Core design characteristics:

```text
Graphite / dark neutral foundation
Olive/lime active signal
Amber attention/approval
Sora headings
Manrope body
Technical monospace where appropriate
```

Avoid flooding the interface with accent colors.

The UI should feel operational and intelligent without becoming decorative.

---

# 146. Agent Execution Runner

Each execution activity should have:

```text
Type
Status
Start Time
Duration
Summary
Details
Error
Related Tool
Related Agent
```

States:

```text
QUEUED
RUNNING
COMPLETED
FAILED
WAITING
CANCELLED
```

---

# 147. Current Activity

The Console should prominently show:

```text
Current Activity
```

Example:

```text
● Searching the web
```

while completed work collapses:

```text
✓ Understanding request
✓ Planning
✓ Checking available tools
```

Users can expand completed activities.

---

# 148. Operational Transparency

Show useful operational information:

```text
Tool invoked
Resource accessed
Execution duration
Result summary
Sources
Approval requested
Retry
Failure
```

Do NOT show private chain-of-thought.

---

# 149. Architecture Observability vs User Observability

These are different.

## User-facing

```text
Searching
Reading
Planning
Executing
Waiting for approval
```

## Engineering-facing

```text
Trace
Span
Database latency
Redis latency
CPU
Memory
Stack trace
Queue depth
```

Never expose internal infrastructure details unnecessarily.

---

# 150. Model Routing

Later implement:

```text
Simple task
    ↓
Qwen 8B

Complex task
    ↓
Larger model

Embedding
    ↓
Embedding model
```

Model routing must be application-controlled.

Do not let the LLM arbitrarily select privileged infrastructure.

---

# 151. Model Fallback

Eventually:

```text
Primary Model
     ↓
Failure
     ↓
Circuit Breaker
     ↓
Fallback Model
```

But fallback should only occur when the fallback model is compatible with the task.

---

# 152. AI Cost and Resource Policy

Every agent execution should eventually expose:

```text
Model
Model duration
Input tokens
Output tokens
Tool count
Tool duration
Execution duration
Queue wait
```

This allows later cost/performance analysis.

---

# 153. Agent Modes and Permissions

Mode must influence available capabilities.

Example:

```text
CHAT
 └── Read-only

PLAN
 └── Read-only

ACT
 └── Authorized mutations

AUTO
 └── Application-controlled selection
```

The mode is not a security boundary by itself.

Authorization remains authoritative.

---

# 154. Human Approval Model

Approval should contain:

```text
approvalId
executionId
action
riskLevel
requestedAt
expiresAt
requestedBy
status
decision
decidedAt
```

States:

```text
PENDING
APPROVED
REJECTED
EXPIRED
CANCELLED
```

---

# 155. Approval Timeout

If approval expires:

```text
PENDING
 ↓
EXPIRED
```

The agent must not automatically assume approval.

The runtime must define the policy.

---

# 156. Execution Cancellation

If cancellation occurs while waiting:

```text
WAITING_FOR_APPROVAL
 ↓
CANCELLED
```

If the tool is already executing, cancellation behavior must depend on whether the underlying operation supports cancellation safely.

---

# 157. Memory Architecture

Memory should not become an uncontrolled second database.

Define:

```text
What is stored?
Why is it stored?
Who can access it?
How long is it retained?
How is it retrieved?
How is it deleted?
```

---

# 158. RAG Trust Boundary

Documents and retrieved chunks are untrusted data.

Never treat:

```text
Document content
Web content
Tool output
```

as higher-priority instructions than system/application policies.

---

# 159. Evaluation Architecture

Evaluation should be reproducible.

Every evaluation should record:

```text
Dataset version
Agent version
Prompt/version
Model
Tool configuration
Result
Evaluator
Score
Latency
Token usage
Timestamp
```

---

# 160. Architecture Metrics

Eventually monitor:

```text
Agent Success Rate
Tool Success Rate
LLM Error Rate
Queue Failure Rate
p50 Latency
p95 Latency
p99 Latency
Approval Completion Rate
Cancellation Rate
RAG Retrieval Quality
Token Usage
```

---

# 161. SLI / SLO Learning

Learn:

## SLI

What is being measured?

Example:

```text
successful execution percentage
```

## SLO

What target do we want?

Example:

```text
99% of executions complete successfully
```

## SLA

What externally committed service level exists?

Do not confuse SLI, SLO and SLA.

---

# 162. Disaster Recovery

Eventually document:

```text
PostgreSQL backup
Redis recovery
Object storage recovery
Event replay
Execution recovery
Configuration recovery
Secret recovery
```

Understand:

```text
RPO
RTO
```

---

# 163. RPO / RTO

## RPO

How much data can we afford to lose?

## RTO

How long can recovery take?

These should become part of production architecture discussions.

---

# 164. Scalability Strategy

Scale different workloads independently.

```text
Gateway
    ↓ horizontal scaling

Worker
    ↓ horizontal scaling based on queue depth

Realtime
    ↓ horizontal scaling based on connections

RAG
    ↓ workload-dependent scaling
```

Do not scale every component identically.

---

# 165. Statelessness

Gateway should ideally be stateless.

Realtime connection state is inherently process-local, so shared infrastructure such as Redis is used for cross-instance coordination.

Workers should persist important execution state externally.

---

# 166. Database Ownership

As the architecture evolves, define ownership.

For example:

```text
Agent domain
    → agent data

Execution domain
    → execution data

Memory domain
    → memory data

RAG domain
    → document/chunk/vector data
```

Avoid multiple services freely mutating each other's tables.

---

# 167. Database Boundary Evolution

Initial:

```text
One PostgreSQL cluster
One database
Logical domain separation
```

Later:

```text
Separate schemas
```

Only later if required:

```text
Separate databases
Separate clusters
```

This follows **evolutionary architecture**.

---

# 168. Redis Boundary Evolution

Initially one Redis deployment can provide:

```text
Queue
Streams
Pub/Sub
Cache
Locks
Rate Limits
```

As scale grows, consider:

```text
Separate Redis instances
```

only when workload isolation requires it.

---

# 169. Infrastructure Isolation

Eventually separate resources based on workload:

```text
Queue Redis
Cache Redis
Realtime Redis
```

only when there is a measurable operational reason.

---

# 170. Microservices Decision Rule

Do not use microservices because:

> "This is an architect project."

Use service separation when:

```text
Independent scaling
Independent deployment
Independent failure domain
Independent security boundary
Independent technology requirement
Independent ownership
```

Otherwise keep a modular monolith.

---

# 171. Modular Monolith Learning Goal

The initial OrchestrAI workspace should teach:

> How to build a modular monolith that can evolve into distributed services.

This is more valuable than immediately creating microservices.

---

# 172. Extraction Readiness

A package is extraction-ready when:

```text
Public API is clear
Internal dependencies are controlled
No circular dependencies
Tests exist
Documentation exists
Versioning strategy exists
Consumer expectations are known
```

---

# 173. NPM Publishing

Eventually:

```text
pnpm build
 ↓
pnpm pack
 ↓
npm publish
```

Packages:

```text
@orchestrai/core
@orchestrai/models
@orchestrai/tools
@orchestrai/agent
@orchestrai/sdk
```

Use semantic versioning.

Understand:

```text
MAJOR
MINOR
PATCH
```

---

# 174. Backward Compatibility

Public packages should not casually break consumers.

Before publishing breaking changes:

```text
Migration guide
Deprecation period where appropriate
Major version
Changelog
```

FinAI should be treated as a real external consumer.

---

# 175. CI/CD

Eventually CI should validate:

```text
Install
Lint
Typecheck
Unit Tests
Integration Tests
Build
Package Validation
Container Build
Security Scan
```

Deployment should be independent per application where appropriate.

---

# 176. Build Order

The preferred vertical implementation order is:

```text
1. Workspace
2. Core
3. Models
4. Tools
5. Agent
6. Runtime
7. Database
8. Queue
9. Worker
10. Events
11. Persistence / Recovery
12. Human Approval
13. Realtime
14. Console
15. Agent Modes
16. Memory
17. RAG
18. Gateway
19. SDK
20. Observability
21. Security Review
22. Evaluation
23. Research Agent
24. Developer Agent
25. Multi-Agent
26. gRPC
27. Kafka
28. Distributed Execution
29. Production Infrastructure
30. Kubernetes
31. Architecture Review
32. Package / Service Extraction
```

---

# 177. Vertical Slice Strategy

Do not complete every package before integrating.

## Slice 1 — Hello Agent

```text
Core
 ↓
Models
 ↓
Tools
 ↓
Agent
```

Goal:

```text
User
 ↓
Qwen
 ↓
Tool
 ↓
Result
```

---

# 178. Slice 2 — Stateful Agent

```text
Agent
 ↓
Runtime
 ↓
LangGraph
```

Goal:

```text
Understand
 ↓
Plan
 ↓
Tool
 ↓
Observe
 ↓
Continue
 ↓
Answer
```

---

# 179. Slice 3 — Async Agent

```text
Gateway
 ↓
Queue
 ↓
Worker
 ↓
Runtime
```

Goal:

```text
HTTP request returns quickly
```

---

# 180. Slice 4 — Evented Agent

```text
Runtime
 ↓
Events
 ↓
Consumers
```

Goal:

```text
Execution lifecycle is observable through events.
```

---

# 181. Slice 5 — Live Agent

```text
Events
 ↓
Realtime
 ↓
WebSocket/SSE
 ↓
Console
```

Goal:

```text
User can watch execution live.
```

---

# 182. Slice 6 — Recoverable Agent

```text
Execution
 ↓
Checkpoint
 ↓
Failure
 ↓
Recovery
 ↓
Resume
```

Goal:

```text
Agent execution is durable.
```

---

# 183. Slice 7 — Remembering Agent

```text
Agent
 ↓
Memory
 ↓
PostgreSQL
```

Goal:

```text
Relevant memory can be persisted and retrieved.
```

---

# 184. Slice 8 — Knowledge Agent

```text
Documents
 ↓
RAG
 ↓
Agent
```

Goal:

```text
Agent can reason over external/private knowledge.
```

---

# 185. Slice 9 — Platform

```text
Gateway
 ↓
SDK
 ↓
FinAI
```

Goal:

```text
FinAI becomes an OrchestrAI consumer.
```

---

# 186. Architecture Learning Progression

The user should progress through:

```text
"I can call an LLM."
        ↓
"I can build an agent."
        ↓
"I understand stateful execution."
        ↓
"I can execute tools safely."
        ↓
"I can run agents asynchronously."
        ↓
"I understand queues and workers."
        ↓
"I understand event-driven systems."
        ↓
"I can stream execution in realtime."
        ↓
"I can recover failed execution."
        ↓
"I can build memory and RAG."
        ↓
"I can evaluate agents."
        ↓
"I can observe distributed execution."
        ↓
"I can build multi-agent systems."
        ↓
"I understand distributed systems."
        ↓
"I can design production architecture."
```

---

# 187. Interview Preparation

The project should continuously produce interview-ready knowledge.

For every major phase, create interview questions.

Examples:

### Architecture

```text
Why modular monolith first?
When would you use microservices?
What is Hexagonal Architecture?
What is Dependency Inversion?
```

### Distributed Systems

```text
What happens if Redis fails?
How do you handle duplicate messages?
What is eventual consistency?
How do you achieve idempotency?
```

### Resilience

```text
Retry vs Circuit Breaker?
What is a Bulkhead?
Why exponential backoff?
Why jitter?
```

### Database

```text
When would you use an index?
How does a composite index work?
What is transaction isolation?
What is SELECT FOR UPDATE?
```

### Messaging

```text
Queue vs Event?
Redis Streams vs Kafka?
At-most-once vs at-least-once?
What is a consumer group?
```

### Realtime

```text
WebSocket vs SSE?
How do you scale WebSockets horizontally?
How do you handle reconnect?
```

### AI

```text
What makes an agent different from a chatbot?
How does tool calling work?
How do you defend against prompt injection?
How do you evaluate an agent?
```

---

# 188. Required Interview Answer Format

Each learning document should include:

```text
Question

Short Interview Answer

Detailed Explanation

OrchestrAI Example

Trade-offs

Follow-up Questions
```

The short answer should be explainable in approximately 30–90 seconds.

---

# 189. Code Quality Rules

Prefer:

```text
Small modules
Explicit dependencies
Strong typing
Clear naming
Pure functions where appropriate
Dependency injection
Typed errors
Schema validation
Deterministic behavior
```

Avoid:

```text
God classes
God services
Huge controllers
Circular dependencies
Implicit global state
Magic strings
Silent errors
Unbounded loops
Unbounded retries
Unbounded tool execution
```

---

# 190. Comments and Documentation

Do not comment obvious code.

Comment:

```text
Why
Trade-off
Invariant
Non-obvious behavior
Failure handling
Concurrency assumption
Security constraint
```

Example:

```ts
// We intentionally do not retry mutation tools here.
// Retrying a non-idempotent operation could duplicate a side effect.
```

That is valuable documentation.

---

# 191. Error Handling

Never silently swallow errors.

Avoid:

```ts
try {
  ...
} catch {
}
```

Use typed errors:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
RateLimitError
TimeoutError
DependencyError
ModelError
ToolExecutionError
AgentExecutionError
```

---

# 192. Configuration

Validate configuration during startup.

Never hardcode:

```text
Passwords
Tokens
API Keys
URLs
Credentials
Secrets
```

Use environment configuration.

Differentiate:

```text
development
test
production
```

---

# 193. Feature Completion Gate

Before marking a feature `[x]`, evaluate:

```text
[ ] Code implemented
[ ] Architecture reviewed
[ ] Error handling
[ ] Validation
[ ] Security review
[ ] Logging considered
[ ] Metrics considered
[ ] Failure scenarios considered
[ ] Tests
[ ] Documentation
[ ] ADR if needed
[ ] Learning note
[ ] Build
[ ] Typecheck
[ ] Lint
[ ] Tests pass
[ ] Status updated
```

If something does not apply:

```text
N/A — reason
```

must be recorded.

---

# 194. Definition of Done

A feature is complete only when:

1. Code exists.
2. Integration works.
3. Failure behavior is understood.
4. Appropriate tests exist.
5. Documentation exists.
6. Architecture is documented.
7. Learning material exists.
8. Status is updated.
9. Known limitations are documented.
10. The next step is explicit.

---

# 195. Implementation Log

The agent MUST maintain:

```text
## Implementation History
```

Each entry:

```text
## YYYY-MM-DD — Feature

Status: [x]

Implemented:
- ...

Files:
- ...

Architecture:
- ...

Patterns:
- ...

Technologies:
- ...

Validation:
- Build:
- Typecheck:
- Lint:
- Tests:

Learning:
- ...

Interview concepts:
- ...

Known limitations:
- ...

Next:
- ...
```

Do not delete historical entries.

---

# 196. Current Progress

The agent MUST update this section continuously.

```text
Current Phase:    Phase 1 — packages/core
Current Feature:  Domain contracts & Zod schemas
Current Status:   [ ] Ready to begin
Overall Progress: Phase 0 Complete [x], Moving to Phase 1
Last Updated:     2026-09-18
```

Phase table:

```text
Phase 0  — Workspace & Foundation              [x]
Phase 1  — Core                                 [ ]
Phase 2  — Models                               [ ]
Phase 3  — Tools                                [ ]
Phase 4  — Agent                                [ ]
Phase 5  — Runtime / LangGraph                 [ ]
Phase 6  — Database                             [ ]
Phase 7  — Queue                                [ ]
Phase 8  — Worker                               [ ]
Phase 9  — Events                               [ ]
Phase 10 — Persistence / Recovery              [ ]
Phase 11 — Human-in-the-loop                   [ ]
Phase 12 — Realtime                             [ ]
Phase 13 — Console                              [ ]
Phase 14 — Agent Modes                          [ ]
Phase 15 — Memory                               [ ]
Phase 16 — RAG                                  [ ]
Phase 17 — Gateway                              [ ]
Phase 18 — SDK                                  [ ]
Phase 19 — Observability                        [ ]
Phase 20 — Reliability Engineering              [ ]
Phase 21 — Security                             [ ]
Phase 22 — Distributed Consistency              [ ]
Phase 23 — Advanced PostgreSQL                  [ ]
Phase 24 — Caching                              [ ]
Phase 25 — Performance                          [ ]
Phase 26 — Evaluation                           [ ]
Phase 27 — Research Agent                       [ ]
Phase 28 — Developer Agent                      [ ]
Phase 29 — Multi-Agent                          [ ]
Phase 30 — gRPC                                 [ ]
Phase 31 — Kafka                                [ ]
Phase 32 — Distributed Execution                [ ]
Phase 33 — Production Infrastructure            [ ]
Phase 34 — Kubernetes                           [ ]
Phase 35 — Architecture Review                  [ ]
Phase 36 — Package / Service Extraction         [ ]
```

---

# 197. Blocked Work

If blocked:

```text
## Blocked Feature

Status: [!]

Blocked by:
- ...

Why:
- ...

Attempted:
- ...

Decision required:
- ...

Options:
- ...

Recommended next investigation:
- ...
```

Do not hide blockers.

---

# 198. Deferred Work

If intentionally deferred:

```text
## Deferred Feature

Feature:
Reason:
Current Alternative:
Trigger to Revisit:
```

---

# 199. Architecture Decision Log

Maintain an index:

```text
ADR-001 — Monorepo First
ADR-002 — Package Boundaries
ADR-003 — Domain Contracts
ADR-004 — Model Provider Abstraction
ADR-005 — Tool Architecture
ADR-006 — LangGraph Runtime
ADR-007 — PostgreSQL
ADR-008 — Redis Queue
ADR-009 — Event Architecture
ADR-010 — Realtime Transport
ADR-011 — Observability
ADR-012 — Polyglot Boundary
ADR-013 — Memory Architecture
ADR-014 — RAG Architecture
ADR-015 — SDK Boundary
ADR-016 — Security Model
ADR-017 — Service Extraction Criteria
```

---

# 200. Architecture Review Checklist

At every major milestone, review:

## Domain

```text
Are responsibilities clear?
Are boundaries clear?
Are invariants enforced?
```

## Code

```text
Are dependencies directional?
Any circular dependencies?
Any God classes?
Any infrastructure leakage?
```

## Database

```text
Correct keys?
Correct indexes?
Correct constraints?
Correct transactions?
```

## Distributed Systems

```text
What can fail?
Can messages duplicate?
Can requests duplicate?
What happens during timeout?
```

## AI

```text
What happens if model output is malformed?
What happens if model hangs?
Can model perform unauthorized action?
Are tool outputs bounded?
```

## Security

```text
Authentication?
Authorization?
Prompt injection?
SSRF?
Secrets?
Audit?
```

## Observability

```text
Can we trace an execution?
Can we identify failures?
Can we measure latency?
Can we identify bottlenecks?
```

---

# 201. Final Target Architecture

The mature architecture should conceptually become:

```text
                         CLIENTS
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
           FinAI       OrchestrAI       Future Apps
                       Console
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                      @orchestrai/sdk
                            │
                            ↓
                         Gateway
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
             Realtime                Runtime
                │                       │
             WebSocket              LangGraph
             SSE                       │
                │              ┌────────┼────────┐
                │              ↓        ↓        ↓
                │           Models    Tools    Memory
                │              │                 │
                │              ↓                 ↓
                │           Ollama              DB
                │
                └──────────── Events
                               │
                     ┌─────────┼─────────┐
                     ↓         ↓         ↓
                  Console   Evaluation Observability
                               │         │
                               │       OTEL
                               │       Prometheus
                               │       Grafana
                               │
                         PostgreSQL
                            │
                         pgvector
                            │
                           RAG
```

---

# 202. Evolution From Monorepo to Distributed Platform

Initial:

```text
                    orchestrai
                        │
         ┌──────────────┼──────────────┐
         ↓              ↓              ↓
       apps          packages      infrastructure
```

Later:

```text
                    orchestrai workspace
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
          Package     Package      Service
             │           │           │
             ↓           ↓           ↓
         npm package  npm package  deployment
```

Eventually:

```text
@orchestrai/core
@orchestrai/models
@orchestrai/tools
@orchestrai/agent
@orchestrai/sdk
@orchestrai/events
@orchestrai/queue
@orchestrai/observability
```

plus independently deployed services where justified.

---

# 203. Final Architecture Philosophy

Do not think:

> "I need many repositories."

Think:

> "I need strong boundaries."

Do not think:

> "I need microservices."

Think:

> "I need independently scalable/deployable boundaries when justified."

Do not think:

> "I need Kafka because this is distributed."

Think:

> "I need reliable event streaming, and Kafka may become appropriate at a certain scale."

Do not think:

> "I need Python because this is AI."

Think:

> "Which workload benefits from Python's AI/ML ecosystem?"

Do not think:

> "I need every design pattern."

Think:

> "Which problem does this pattern solve?"

---

# 204. Most Important Rule

The purpose of OrchestrAI is not only to create software.

It is to develop the ability to **design, implement, explain, operate, debug, scale, and defend software architecture**.

Therefore every implementation must follow:

```text
Understand the Problem
        ↓
Choose Architecture
        ↓
Identify Trade-offs
        ↓
Design Contract
        ↓
Implement
        ↓
Test
        ↓
Observe
        ↓
Break It Intentionally
        ↓
Understand Failure
        ↓
Document
        ↓
Update Status
        ↓
Continue
```

The coding agent must not merely produce code.

It must help the user understand:

```text
WHY
WHAT
HOW
TRADE-OFFS
FAILURE MODES
SCALING
SECURITY
OPERATIONS
```

---

# 205. AI Coding Agent Final Instruction

When starting any new session:

```text
1. Read ORCHESTRAI-IMPLEMENTATION.md.
2. Read Current Progress.
3. Read recent Implementation History.
4. Inspect the current code.
5. Identify the exact incomplete feature.
6. Do not restart completed work.
7. Implement only the next coherent unit of work.
8. Validate it.
9. Explain the architecture used.
10. Explain the engineering concepts learned.
11. Add/update ADRs where required.
12. Update the implementation status.
13. Record known limitations.
14. Record the exact next step.
15. Leave the repository in a clean continuation state.
```

If the previous session stopped at:

```text
Phase 9
Feature: Event consumer idempotency
Status: [~]
```

the next agent must continue there rather than beginning from Phase 0.

---

# 206. Final Definition of OrchestrAI

At maturity, OrchestrAI should be capable of being described in an architecture interview as:

> **A local-first, modular AI orchestration platform using stateful agent execution, tool-based capabilities, asynchronous worker processing, event-driven execution, realtime streaming, controlled memory and RAG, centralized observability, evaluation infrastructure, and explicit resilience and security boundaries. The system begins as a modular monorepo and is designed for evolutionary extraction into reusable npm packages and independently deployable services as real scaling, ownership, or operational requirements emerge.**

The user should be able to explain not only **how the system works**, but **why it was designed this way, what alternatives were considered, what happens when dependencies fail, how state and consistency are maintained, how the system scales, and where the architectural boundaries should evolve.**

---

# 207. The End State

The learning journey is:

```text
LLM
 ↓
Agent
 ↓
Tools
 ↓
State
 ↓
LangGraph
 ↓
Runtime
 ↓
Database
 ↓
Queue
 ↓
Worker
 ↓
Events
 ↓
Human Approval
 ↓
Realtime
 ↓
Console
 ↓
Memory
 ↓
RAG
 ↓
Gateway
 ↓
SDK
 ↓
Observability
 ↓
Evaluation
 ↓
Security
 ↓
Reliability
 ↓
Multi-Agent
 ↓
Distributed Systems
 ↓
Kafka / gRPC
 ↓
Production Infrastructure
 ↓
Architecture Evolution
 ↓
Package / Service Extraction
```

And the final engineering progression is:

```text
"I can call an LLM."

        ↓

"I can build an agent."

        ↓

"I understand agent state."

        ↓

"I can safely give an agent tools."

        ↓

"I can run agents asynchronously."

        ↓

"I understand queues and workers."

        ↓

"I understand event-driven systems."

        ↓

"I can stream execution in realtime."

        ↓

"I can recover failed executions."

        ↓

"I can build memory and RAG."

        ↓

"I can evaluate agent quality."

        ↓

"I can observe distributed execution."

        ↓

"I can design resilient systems."

        ↓

"I can build multi-agent systems."

        ↓

"I understand distributed architecture."

        ↓

"I can design production systems."

        ↓

"I can explain and defend my architecture
in a Software Architect / Tech Lead interview."
```

**This document is the master source of truth for that journey.**
