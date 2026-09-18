# Phase 6: `infrastructure/postgres` — Database & PostgreSQL Schemas

## Objectives

Establish the persistence foundation, relational data models, vector storage, and concurrency primitives for OrchestrAI, providing:

1. Base PostgreSQL initialization with `uuid-ossp`, `pgcrypto`, and `vector` (pgvector).
2. Modular DDL migrations modeling core agent domains, multi-tenancy, execution runs, granular steps, multimodal chat messages, audited tool calls, and HITL approval tickets.
3. Durable execution state snapshots (`checkpoints`) matching `@orchestrai/runtime`'s `ICheckpointer` interface with unique `(execution_id, step_index)` guarantees.
4. Transactional Outbox pattern (`outbox`) to solve the distributed dual-write consistency problem between PostgreSQL and Redis/BullMQ.
5. High-performance indexing architecture:
   - Partial indexes for pending approvals and FIFO outbox draining.
   - GIN indexes for JSONB variables and metadata containment queries.
   - HNSW indexes for sub-millisecond vector similarity search (`vector_cosine_ops`).
6. Complete Prisma ORM schema mapping for type-safe application access.
7. Production and educational SQL query handbook covering ACID transactions, optimistic UPSERTs, pessimistic locking with `SELECT FOR UPDATE SKIP LOCKED`, CTE window functions, recursive agent hierarchies, and materialized views with concurrent refresh.

---

## Package Location

`infrastructure/postgres/`

---

## Invariant Rules & Dependency Flow

1. Sits in the **Infrastructure / Persistence Layer**.
2. Aligns with domain contracts defined in `@orchestrai/core` (enums, identifiers, message schemas, approval structures).
3. Enforces invariants at the **database level** (foreign key cascades, check constraints, unique constraints, and non-negative counts).
4. Strictly adheres to the **250-line rule** across all SQL and Prisma definition files.

---

## File Layout

```text
infrastructure/postgres/
├── init/
│   └── 01_extensions.sql                # uuid-ossp, pgcrypto, vector
├── migrations/
│   ├── 0001_core_entities.sql           # tenants, agents, conversations, executions, execution_steps
│   ├── 0002_messages_and_tools.sql      # messages, tool_calls, approvals (HITL)
│   ├── 0003_checkpoints_and_outbox.sql  # checkpoints (runtime DAG state), outbox (event bus)
│   ├── 0004_memory_and_rag.sql          # memory_items, documents, document_chunks (pgvector)
│   └── 0005_indexes_and_constraints.sql # Check constraints, partial, GIN, HNSW indexes
├── prisma/
│   └── schema.prisma                    # Prisma 5 ORM model mapping
├── queries/
│   ├── 01_transactional_outbox.sql      # Atomic status update + outbox enqueue
│   ├── 02_checkpoint_upsert.sql         # Idempotent state snapshotting & hydration
│   ├── 03_outbox_worker_polling.sql     # High-throughput FOR UPDATE SKIP LOCKED polling
│   ├── 04_execution_timeline_window.sql # CTEs and Window functions for step latency breakdown
│   ├── 05_agent_delegation_recursive_cte.sql # Recursive CTE hierarchical sub-agent tree traversal
│   └── 06_token_usage_materialized_view.sql  # Materialized view with CONCURRENT refresh
└── README.md
infrastructure/docker/
└── docker-compose.postgres.yml          # PostgreSQL 16 container with pgvector and auto-init
```

---

## Core Engineering Principles & Architectural Mechanics

### 1. The Dual-Write Problem & The Transactional Outbox Pattern

In distributed systems, executing an agent action requires two mutations:

1. Updating the database record (e.g. `executions.status = 'COMPLETED'`).
2. Publishing an event to a message broker (e.g. Redis Pub/Sub, BullMQ, or Kafka).

If the service crashes after step 1 but before step 2, or if the network to Redis drops, the database update succeeds but the message broker never learns about it. The system enters an inconsistent state.

**The Solution**:
Both the execution state update and an event envelope are written into PostgreSQL within the **same atomic database transaction** (`BEGIN ... COMMIT`). An outbox dispatcher worker periodically polls the `outbox` table using `SELECT FOR UPDATE SKIP LOCKED`, pushes events to the broker, and marks them `PUBLISHED`. If the dispatcher crashes, uncommitted events remain intact and are safely retried.

### 2. High-Throughput Worker Concurrency with `SKIP LOCKED`

Traditional queue polling using `SELECT ... FOR UPDATE` causes workers to block one another whenever they attempt to read the same rows.
`SELECT ... FOR UPDATE SKIP LOCKED` instructs PostgreSQL to instantly skip any rows currently locked by another active transaction. Multiple worker processes or threads can drain the outbox queue simultaneously without lock contention or deadlocks.

### 3. Partial Index Optimization

An outbox table in an agentic platform may accumulate millions of historical events, of which 99.9% are already `PUBLISHED`. A regular B-Tree index on `(created_at)` would index millions of irrelevant rows.
A partial index:

```sql
CREATE INDEX idx_outbox_pending_fifo ON outbox(created_at ASC) WHERE status = 'PENDING';
```

indexes **only** the rows with `status = 'PENDING'`. The index size remains tiny (a few kilobytes), fits entirely in CPU cache, and allows workers to perform microsecond index scans directly to pending jobs.

---

## Verification & Build Validation

1. Verified all SQL migration scripts for syntax correctness and constraint integrity.
2. Verified Prisma schema (`schema.prisma`) syntax, relations, and attribute mappings.
3. Verified zero line-count violations (< 250 lines) across all infrastructure scripts.
4. Monorepo workspace typecheck: `pnpm typecheck` passed with 0 errors.
