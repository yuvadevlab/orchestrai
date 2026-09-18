# PostgreSQL Infrastructure & Persistence

This directory contains the database schema, SQL migrations, index definitions, Prisma ORM mapping, and educational query patterns for OrchestrAI.

## Directory Layout

```text
infrastructure/postgres/
├── init/
│   └── 01_extensions.sql              # PostgreSQL extensions (uuid-ossp, pgcrypto, vector)
├── migrations/
│   ├── 0001_core_entities.sql         # Tenants, agents, conversations, executions, steps
│   ├── 0002_messages_and_tools.sql    # Messages, tool_calls, approvals (HITL)
│   ├── 0003_checkpoints_and_outbox.sql# State checkpoints, transactional outbox
│   ├── 0004_memory_and_rag.sql        # Memory items, documents, chunks with pgvector
│   └── 0005_indexes_and_constraints.sql # Check constraints, partial, GIN, HNSW indexes
├── prisma/
│   └── schema.prisma                  # Prisma ORM schema mapping
└── queries/
    ├── 01_transactional_outbox.sql    # ACID state update + outbox write
    ├── 02_checkpoint_upsert.sql       # Idempotent checkpoint UPSERT & state hydration
    ├── 03_outbox_worker_polling.sql   # FOR UPDATE SKIP LOCKED concurrent polling
    ├── 04_execution_timeline_window.sql # CTEs & Window functions for timeline analysis
    ├── 05_agent_delegation_recursive_cte.sql # Recursive CTE sub-agent hierarchy traversal
    └── 06_token_usage_materialized_view.sql  # Materialized view with CONCURRENT refresh
```

## Running PostgreSQL Locally

Start the local PostgreSQL 16 instance with pgvector using Docker Compose:

```bash
docker compose -f infrastructure/docker/docker-compose.postgres.yml up -d
```

Check container health:

```bash
docker compose -f infrastructure/docker/docker-compose.postgres.yml ps
```

The database initializes automatically by executing all SQL files in `init/` followed by `migrations/`.

## Key Invariants & Design Principles

1. **Transactional Outbox**:
   - Updates to execution state and publication of domain events happen in the **same transaction**.
   - Solves the dual-write problem between PostgreSQL and Redis/BullMQ.
2. **Partial Indexes**:
   - `idx_approvals_pending`: Instantly retrieves blocking HITL approvals without full-table scans.
   - `idx_outbox_pending_fifo`: Filters exclusively for unprocessed events (`WHERE status = 'PENDING'`).
   - `idx_executions_active`: Accelerates live supervisor monitoring dashboards.
3. **Vector Search Ready**:
   - 1536-dimension pgvector column on `memory_items` and `document_chunks`.
   - Indexed via HNSW (`vector_cosine_ops`) for sub-millisecond approximate nearest neighbor search.
4. **Idempotent Checkpoints**:
   - Unique constraint `(execution_id, step_index)` guarantees repeatable resume and crash recovery without state duplication.
