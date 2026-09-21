-- ============================================================================
-- Query: upsert_chunk.sql
-- Description: Idempotent upsert of a document chunk with pgvector embedding.
-- Parameters:
--   $1: document_id (UUID)
--   $2: chunk_index (INT)
--   $3: content (TEXT)
--   $4: embedding (vector or NULL)
--   $5: token_count (INT)
--   $6: metadata (JSONB)
-- ============================================================================

INSERT INTO document_chunks (
    document_id,
    chunk_index,
    content,
    embedding,
    token_count,
    metadata,
    created_at
)
VALUES (
    $1,
    $2,
    $3,
    $4::vector,
    $5,
    $6,
    NOW()
)
ON CONFLICT (document_id, chunk_index) DO UPDATE
SET
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    token_count = EXCLUDED.token_count,
    metadata = EXCLUDED.metadata
RETURNING
    chunk_id,
    document_id,
    chunk_index,
    content,
    embedding::text,
    token_count,
    metadata,
    created_at;
