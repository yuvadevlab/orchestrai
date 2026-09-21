-- ============================================================================
-- Query: keyword_search.sql
-- Description: Sparse lexical keyword search matching chunk text content.
-- Parameters:
--   $1: pattern (LIKE pattern string e.g. '%query%')
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
    1.0 AS score
FROM document_chunks c
JOIN documents d ON c.document_id = d.document_id
WHERE c.content ILIKE $1
LIMIT $2;
