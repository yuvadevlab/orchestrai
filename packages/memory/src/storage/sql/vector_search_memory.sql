-- ============================================================================
-- Query: vector_search_memory.sql
-- Description: pgvector cosine similarity search over agent memory items.
-- Parameters:
--   $1: vector (vector text format e.g. '[0.1, 0.2, ...]')
--   $2: tenant_id (UUID)
--   $3: agent_id (UUID or NULL)
--   $4: min_score (FLOAT)
--   $5: limit (INT)
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
    (1 - (embedding <=> $1::vector)) AS score
FROM memory_items
WHERE tenant_id = $2
  AND ($3::uuid IS NULL OR agent_id = $3::uuid)
  AND (embedding IS NOT NULL)
  AND (1 - (embedding <=> $1::vector)) >= $4
ORDER BY embedding <=> $1::vector ASC
LIMIT $5;
