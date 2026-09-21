-- ============================================================================
-- Query: vector_search.sql
-- Description: Dense semantic search using pgvector cosine distance operator (<=>).
-- Parameters:
--   $1: vector (vector text format e.g. '[0.1, 0.2, ...]')
--   $2: limit (INT)
-- ============================================================================

SELECT
    c.chunk_id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.embedding::text,
    c.token_count,
    c.metadata,
    c.created_at,
    d.title AS doc_title,
    d.source_uri,
    (1 - (c.embedding <=> $1::vector)) AS similarity
FROM document_chunks c
JOIN documents d ON c.document_id = d.document_id
WHERE c.embedding IS NOT NULL
ORDER BY similarity DESC
LIMIT $2;
