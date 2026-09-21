-- ============================================================================
-- Query: get_chunks_by_document.sql
-- Description: Retrieves ordered chunks for a document.
-- Parameters:
--   $1: document_id (UUID)
-- ============================================================================

SELECT
    chunk_id,
    document_id,
    chunk_index,
    content,
    embedding::text,
    token_count,
    metadata,
    created_at
FROM document_chunks
WHERE document_id = $1
ORDER BY chunk_index ASC;
