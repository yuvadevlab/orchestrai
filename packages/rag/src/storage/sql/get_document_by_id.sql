-- ============================================================================
-- Query: get_document_by_id.sql
-- Description: Retrieves a single document by its primary UUID key.
-- Parameters:
--   $1: document_id (UUID)
-- ============================================================================

SELECT
    document_id,
    tenant_id,
    title,
    source_uri,
    mime_type,
    metadata,
    created_at,
    updated_at
FROM documents
WHERE document_id = $1;
