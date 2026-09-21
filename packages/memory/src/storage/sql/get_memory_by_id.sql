-- ============================================================================
-- Query: get_memory_by_id.sql
-- Description: Retrieves a single memory item by primary UUID key.
-- Parameters:
--   $1: memory_id (UUID)
-- ============================================================================

SELECT
    memory_id,
    tenant_id,
    agent_id,
    conversation_id,
    memory_type,
    content,
    embedding::text,
    metadata,
    created_at
FROM memory_items
WHERE memory_id = $1
LIMIT 1;
