# PostgreSQL Infrastructure & Persistence

This directory contains the database schema, SQL migrations, index definitions, Prisma ORM mapping, advanced query handbooks, and optimization scripts for OrchestrAI.

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
│   ├── 0005_indexes_and_constraints.sql # Check constraints, partial, GIN, HNSW indexes
│   └── 0006_advanced_postgresql_optimizations.sql # FTS GIN, advisory locks, partitioning, materialized views
├── prisma/
│   └── schema.prisma                  # Prisma ORM schema mapping
├── queries/
│   ├── 01_transactional_outbox.sql    # ACID state update + outbox write
│   ├── 02_checkpoint_upsert.sql       # Idempotent checkpoint UPSERT & state hydration
│   ├── 03_outbox_worker_polling.sql   # FOR UPDATE SKIP LOCKED concurrent polling
│   ├── 04_execution_timeline_window.sql # CTEs & Window functions for timeline analysis
│   ├── 05_agent_delegation_recursive_cte.sql # Recursive CTE sub-agent hierarchy traversal
│   ├── 06_token_usage_materialized_view.sql  # Materialized view with CONCURRENT refresh
│   ├── 07_fulltext_vector_hybrid_search.sql  # Hybrid BM25 (FTS) + pgvector RRF ranking
│   ├── 08_advisory_locks_and_concurrency.sql # Session/xact advisory locks & SKIP LOCKED
│   ├── 09_explain_analyze_benchmarks.sql     # Query plan cost profiling & index benchmarks
│   └── 10_partitioning_and_archival.sql      # Monthly temporal range partitioning strategy
└── scripts/
    └── verify-postgres-optimizations.ts # Automated migration & query handbook validator
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

## Key Invariants & Optimization Principles

1. **Transactional Outbox**:
   - Updates to execution state and publication of domain events happen in the **same transaction**.
   - Solves the dual-write problem between PostgreSQL and Redis/BullMQ.
2. **Partial & Composite Indexes**:
   - `idx_approvals_pending`: Instantly retrieves blocking HITL approvals without full-table scans.
   - `idx_outbox_pending_fifo`: Filters exclusively for unprocessed events (`WHERE status = 'PENDING'`).
   - `idx_executions_tenant_status`: Accelerates tenant-filtered supervisor queries.
3. **Full-Text & Vector Hybrid Retrieval**:
   - English `tsvector` generated search vector columns with GIN indexes (`idx_document_chunks_fts`).
   - 1536-dimension pgvector column with HNSW (`vector_cosine_ops`) index.
   - Combines sparse keyword rank (`ts_rank_cd`) and dense vector cosine distance via SQL Reciprocal Rank Fusion (RRF).
4. **Advisory Locks & Concurrency Control**:
   - Session-level (`orchestrai_try_advisory_lock`) and transaction-level (`pg_advisory_xact_lock`) locks.
   - Non-blocking concurrent work polling using `SELECT FOR UPDATE SKIP LOCKED`.
5. **Partitioning & Materialized Views**:
   - Range-partitioned `outbox_partitioned` table by date with automated partition creation procedures.
   - Materialized view `mv_tenant_token_telemetry` for token usage and cost telemetry with concurrent refresh capabilities (`REFRESH MATERIALIZED VIEW CONCURRENTLY`).
