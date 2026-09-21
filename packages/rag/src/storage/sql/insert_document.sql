-- ============================================================================
-- Query: insert_document.sql
-- Description: Registers a parent document entity under a tenant partition.
-- Parameters:
--   $1: tenant_id (UUID)
--   $2: title (VARCHAR)
--   $3: source_uri (TEXT)
--   $4: mime_type (VARCHAR)
--   $5: metadata (JSONB)
-- ============================================================================

INSERT INTO documents (
    tenant_id,
    title,
    source_uri,
    mime_type,
    metadata,
    created_at,
    updated_at
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    NOW(),
    NOW()
)
RETURNING
    document_id,
    tenant_id,
    title,
    source_uri,
    mime_type,
    metadata,
    created_at,
    updated_at;
