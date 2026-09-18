-- ============================================================================
-- Migration: 0005_indexes_and_constraints.sql
-- Description: Check constraints, B-Tree, partial, GIN, and HNSW vector indexes.
-- Performance: Prevents full-table scans on high-frequency operational paths.
-- ============================================================================

-- 1. Domain Check Constraints: Enforces valid state machine enums at DB level
ALTER TABLE agents ADD CONSTRAINT chk_agent_mode 
    CHECK (mode IN ('CHAT', 'PLAN', 'ACT', 'AUTO'));

ALTER TABLE executions ADD CONSTRAINT chk_execution_status 
    CHECK (status IN ('PENDING', 'RUNNING', 'SUSPENDED', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMED_OUT'));

ALTER TABLE messages ADD CONSTRAINT chk_message_role 
    CHECK (role IN ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL'));

ALTER TABLE approvals ADD CONSTRAINT chk_approval_status 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'TIMED_OUT'));

ALTER TABLE tool_calls ADD CONSTRAINT chk_tool_permission 
    CHECK (permission_level IN ('READ_ONLY', 'WRITE_SAFE', 'SENSITIVE', 'DANGEROUS'));

ALTER TABLE outbox ADD CONSTRAINT chk_outbox_status 
    CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED'));

-- 2. Foreign Key B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_agents_tenant ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_executions_agent ON executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_executions_conversation ON executions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_execution_steps_exec ON execution_steps(execution_id, step_index ASC);
CREATE INDEX IF NOT EXISTS idx_messages_exec ON messages(execution_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_tool_calls_exec ON tool_calls(execution_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_exec_step ON checkpoints(execution_id, step_index DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON document_chunks(document_id, chunk_index ASC);

-- 3. Partial Indexes for High-Frequency Targeted Lookups
-- Rapid lookup of pending human approvals without scanning millions of historical records
CREATE INDEX IF NOT EXISTS idx_approvals_pending 
    ON approvals(execution_id) 
    WHERE status = 'PENDING';

-- High-throughput FIFO polling for outbox relay worker (zero-scan on published events)
CREATE INDEX IF NOT EXISTS idx_outbox_pending_fifo 
    ON outbox(created_at ASC) 
    WHERE status = 'PENDING';

-- Live monitoring and supervisor queries on active executions
CREATE INDEX IF NOT EXISTS idx_executions_active 
    ON executions(created_at DESC) 
    WHERE status IN ('PENDING', 'RUNNING', 'SUSPENDED');

-- 4. GIN Indexes for Structured JSONB Querying
CREATE INDEX IF NOT EXISTS idx_executions_variables_gin ON executions USING gin (variables);
CREATE INDEX IF NOT EXISTS idx_agents_metadata_gin ON agents USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_messages_metadata_gin ON messages USING gin (metadata);

-- 5. HNSW pgvector Cosine Indexes for Semantic Search
CREATE INDEX IF NOT EXISTS idx_memory_items_embedding 
    ON memory_items USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
    ON document_chunks USING hnsw (embedding vector_cosine_ops);
