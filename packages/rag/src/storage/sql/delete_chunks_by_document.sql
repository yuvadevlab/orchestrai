-- ============================================================================
-- Query: delete_chunks_by_document.sql
-- Description: Deletes all chunks associated with a document.
-- Parameters:
--   $1: document_id (UUID)
-- ============================================================================

DELETE FROM document_chunks
WHERE document_id = $1;
