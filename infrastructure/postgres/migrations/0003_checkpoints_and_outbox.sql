-- ============================================================================
-- Migration: 0003_checkpoints_and_outbox.sql
-- Description: State checkpoint snapshots and transactional outbox event log.
-- Invariants: Outbox table enables zero-loss event dispatching via CDC/polling.
-- ============================================================================

-- 1. Checkpoints Table: Durable state machine snapshots (LangGraph checkpointer)
CREATE TABLE IF NOT EXISTS checkpoints (
    checkpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(execution_id) ON DELETE CASCADE,
    step_index INT NOT NULL CHECK (step_index >= 0),
    node_name VARCHAR(64) NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_checkpoint_step UNIQUE (execution_id, step_index)
);

-- 2. Outbox Table: Transactional Outbox Pattern for reliable distributed event publication
-- Solves the Dual-Write Problem: Writes state + event in the same DB transaction.
CREATE TABLE IF NOT EXISTS outbox (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES executions(execution_id) ON DELETE CASCADE,
    trace_id VARCHAR(64) NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL DEFAULT 'Execution',
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);
