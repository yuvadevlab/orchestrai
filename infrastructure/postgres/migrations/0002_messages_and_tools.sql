-- ============================================================================
-- Migration: 0002_messages_and_tools.sql
-- Description: Conversation messages, tool call invocations, and HITL approvals.
-- Invariants: Foreign keys link tool actions and approvals directly to executions.
-- ============================================================================

-- 1. Messages Table: Preserves conversational turn history and multimodal blocks
CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(execution_id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    role VARCHAR(32) NOT NULL,
    content JSONB NOT NULL,
    name VARCHAR(120),
    tool_calls JSONB,
    tool_call_id VARCHAR(64),
    token_count INT CHECK (token_count IS NULL OR token_count >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tool Calls Table: Detailed audit trail of all external capabilities invoked
CREATE TABLE IF NOT EXISTS tool_calls (
    call_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(execution_id) ON DELETE CASCADE,
    step_id UUID REFERENCES execution_steps(step_id) ON DELETE SET NULL,
    tool_name VARCHAR(100) NOT NULL,
    arguments JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    permission_level VARCHAR(32) NOT NULL DEFAULT 'READ_ONLY',
    is_error BOOLEAN NOT NULL DEFAULT FALSE,
    duration_ms INT NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Approvals Table: Human-in-the-Loop (HITL) clearance gates for sensitive tools
CREATE TABLE IF NOT EXISTS approvals (
    approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(execution_id) ON DELETE CASCADE,
    step_id UUID REFERENCES execution_steps(step_id) ON DELETE SET NULL,
    tool_name VARCHAR(100) NOT NULL,
    tool_arguments JSONB NOT NULL,
    rationale TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    operator_id VARCHAR(128),
    rejection_reason VARCHAR(500),
    modified_arguments JSONB,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    decided_at TIMESTAMPTZ
);
