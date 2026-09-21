-- ============================================================================
-- Migration: 0006_advanced_postgresql_optimizations.sql
-- Description: Full-text search (tsvector + GIN), composite B-Tree indexes,
--              PostgreSQL advisory locks, range table partitioning, and
--              materialized view token telemetry with concurrent refresh.
-- Performance: Optimizes multi-tenant queries, hybrid retrieval, and locking.
-- ============================================================================

-- 1. Full-Text Search (FTS) Generated Columns & GIN Indexes
-- Automatically maintains English text search tsvector columns for keyword search
ALTER TABLE document_chunks 
    ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

ALTER TABLE memory_items 
    ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_document_chunks_fts 
    ON document_chunks USING gin (search_vector);

CREATE INDEX IF NOT EXISTS idx_memory_items_fts 
    ON memory_items USING gin (search_vector);

-- 2. Composite B-Tree Indexes for Multi-Tenant Scoped Filtering
-- Accelerates filtering executions by tenant and execution status
CREATE INDEX IF NOT EXISTS idx_executions_tenant_status 
    ON executions (tenant_id, status, created_at DESC);

-- Accelerates loading conversation message history ordered chronologically
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages (conversation_id, created_at ASC) 
    WHERE conversation_id IS NOT NULL;

-- Accelerates memory retrieval filtered by tenant and memory classification
CREATE INDEX IF NOT EXISTS idx_memory_tenant_type_created 
    ON memory_items (tenant_id, memory_type, created_at DESC);

-- 3. PostgreSQL Advisory Lock Helper Stored Functions
-- Session-level advisory lock helper returning true if lock was acquired
CREATE OR REPLACE FUNCTION orchestrai_try_advisory_lock(lock_key bigint) 
RETURNS boolean 
LANGUAGE sql 
AS $$
    SELECT pg_try_advisory_lock(lock_key);
$$;

-- Advisory unlock helper releasing session-level lock
CREATE OR REPLACE FUNCTION orchestrai_advisory_unlock(lock_key bigint) 
RETURNS boolean 
LANGUAGE sql 
AS $$
    SELECT pg_advisory_unlock(lock_key);
$$;

-- 4. Temporal Range Partitioning Strategy for Outbox Event Log
-- Creates a partitioned template for high-volume domain event streaming
CREATE TABLE IF NOT EXISTS outbox_partitioned (
    event_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    execution_id UUID NOT NULL,
    trace_id VARCHAR(64) NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL DEFAULT 'Execution',
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    PRIMARY KEY (event_id, created_at)
) PARTITION BY RANGE (created_at);

-- Automated monthly partition creation procedure
CREATE OR REPLACE PROCEDURE create_outbox_partition(
    partition_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    partition_name TEXT;
    start_date TIMESTAMPTZ;
    end_date TIMESTAMPTZ;
BEGIN
    start_date := date_trunc('month', partition_date);
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'outbox_p' || to_char(start_date, 'YYYY_MM');

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF outbox_partitioned FOR VALUES FROM (%L) TO (%L);',
        partition_name, start_date, end_date
    );
END;
$$;

-- 5. Materialized View for Multi-Tenant LLM Token Usage Telemetry
-- Precomputes token usage and estimated cost metrics grouped by tenant and model
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_tenant_token_telemetry AS
SELECT 
    e.tenant_id,
    COALESCE(m.name, 'unknown') AS model_name,
    COUNT(DISTINCT e.execution_id) AS total_executions,
    SUM(s.tokens_used) AS total_tokens,
    SUM(s.duration_ms) AS total_duration_ms,
    MAX(s.created_at) AS last_activity_at
FROM executions e
JOIN execution_steps s ON s.execution_id = e.execution_id
LEFT JOIN agents a ON a.agent_id = e.agent_id
LEFT JOIN LATERAL (
    SELECT a.model_config->>'model' AS name
) m ON TRUE
GROUP BY e.tenant_id, COALESCE(m.name, 'unknown');

-- Unique composite index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_tenant_token_telemetry_pk 
    ON mv_tenant_token_telemetry (tenant_id, model_name);
