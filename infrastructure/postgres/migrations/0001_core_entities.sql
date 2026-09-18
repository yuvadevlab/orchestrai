-- ============================================================================
-- Migration: 0001_core_entities.sql
-- Description: Base multi-tenancy, agent configurations, executions, and steps.
-- Invariants: Strict UUID PKs, foreign key cascades, and timestamp tracking.
-- ============================================================================

-- 1. Tenants Table: Top-level organizational isolation boundary
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Agents Table: Declarative configuration, system prompt, and model settings
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    mode VARCHAR(32) NOT NULL DEFAULT 'AUTO',
    system_prompt TEXT NOT NULL,
    model_config JSONB NOT NULL,
    enabled_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_steps INT NOT NULL DEFAULT 25 CHECK (max_steps > 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3. Conversations Table: Thread of interaction linking user prompts to executions
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 4. Executions Table: Lifecycle runs of an agent against a prompt or task
CREATE TABLE IF NOT EXISTS executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    current_step_index INT NOT NULL DEFAULT 0 CHECK (current_step_index >= 0),
    idempotency_key VARCHAR(128) UNIQUE,
    trace_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(128),
    timeout_ms INT NOT NULL DEFAULT 300000 CHECK (timeout_ms > 0),
    variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 5. Execution Steps Table: Granular recording of each state-machine transition
CREATE TABLE IF NOT EXISTS execution_steps (
    step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(execution_id) ON DELETE CASCADE,
    step_index INT NOT NULL CHECK (step_index >= 0),
    node_name VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    input_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    tokens_used INT NOT NULL DEFAULT 0 CHECK (tokens_used >= 0),
    duration_ms INT NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_execution_step UNIQUE (execution_id, step_index)
);
