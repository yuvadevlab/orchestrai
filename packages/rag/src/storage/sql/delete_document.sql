-- ============================================================================
-- Query: delete_document.sql
-- Description: Cascading deletion of a document and its associated chunks.
-- Parameters:
--   $1: document_id (UUID)
-- ============================================================================

DELETE FROM documents
WHERE document_id = $1;
