-- ============================================================================
-- Query: upsert_memory.sql
-- Description: Inserts or updates an agent memory record with vector embedding.
-- Parameters:
--   $1: memory_id (UUID)
--   $2: tenant_id (UUID)
--   $3: agent_id (UUID)
--   $4: conversation_id (UUID or NULL)
--   $5: memory_type (VARCHAR)
--   $6: content (TEXT)
--   $7: embedding (vector or NULL)
--   $8: metadata (JSONB)
--   $9: created_at (TIMESTAMPTZ)
-- ============================================================================

INSERT INTO memory_items (
    memory_id,
    tenant_id,
    agent_id,
    conversation_id,
    memory_type,
    content,
    embedding,
    metadata,
    created_at
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7::vector,
    $8::jsonb,
    $9
)
ON CONFLICT (memory_id) DO UPDATE SET
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata,
    memory_type = EXCLUDED.memory_type;
