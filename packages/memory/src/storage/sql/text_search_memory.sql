-- ============================================================================
-- Query: text_search_memory.sql
-- Description: Keyword fallback search for agent memory items.
-- Parameters:
--   $1: pattern (LIKE pattern string e.g. '%query%')
--   $2: tenant_id (UUID)
--   $3: agent_id (UUID or NULL)
--   $4: limit (INT)
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
    created_at,
    1.0 AS score
FROM memory_items
WHERE tenant_id = $2
  AND ($3::uuid IS NULL OR agent_id = $3::uuid)
  AND content ILIKE $1
ORDER BY created_at DESC
LIMIT $4;
