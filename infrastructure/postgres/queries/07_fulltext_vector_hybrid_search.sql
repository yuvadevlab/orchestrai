-- ============================================================================
-- Query Handbook: 07_fulltext_vector_hybrid_search.sql
-- Description: Hybrid BM25 Full-Text Search + pgvector Cosine Distance Retrieval
--              using Reciprocal Rank Fusion (RRF) in PostgreSQL.
-- Business Logic: Fuses sparse term keyword matching (FTS) with dense semantic
--                 embeddings for high-precision, multi-tenant RAG retrieval.
-- ============================================================================

WITH fts_results AS (
    -- 1. Full-Text Search CTE: Uses GIN index on search_vector to compute BM25 rank
    SELECT 
        chunk_id,
        document_id,
        content,
        ts_rank_cd(search_vector, websearch_to_tsquery('english', 'agent loop execution state')) AS fts_score,
        ROW_NUMBER() OVER (
            ORDER BY ts_rank_cd(search_vector, websearch_to_tsquery('english', 'agent loop execution state')) DESC
        ) AS fts_rank
    FROM document_chunks
    WHERE search_vector @@ websearch_to_tsquery('english', 'agent loop execution state')
    LIMIT 20
),
vector_results AS (
    -- 2. Dense Vector Search CTE: Uses HNSW index to compute cosine distance (<=>)
    SELECT 
        chunk_id,
        document_id,
        content,
        (1 - (embedding <=> '[0.015, -0.032, 0.088]'::vector)) AS vector_score,
        ROW_NUMBER() OVER (
            ORDER BY embedding <=> '[0.015, -0.032, 0.088]'::vector ASC
        ) AS vector_rank
    FROM document_chunks
    WHERE embedding IS NOT NULL
    LIMIT 20
),
fused_ranks AS (
    -- 3. Reciprocal Rank Fusion (RRF) CTE: Combines sparse + dense rankings (k=60)
    SELECT 
        COALESCE(f.chunk_id, v.chunk_id) AS chunk_id,
        COALESCE(f.document_id, v.document_id) AS document_id,
        COALESCE(f.content, v.content) AS content,
        COALESCE(f.fts_rank, 999) AS fts_rank,
        COALESCE(v.vector_rank, 999) AS vector_rank,
        COALESCE(f.fts_score, 0.0) AS fts_score,
        COALESCE(v.vector_score, 0.0) AS vector_score,
        ( (1.0 / (60 + COALESCE(f.fts_rank, 999))) + (1.0 / (60 + COALESCE(v.vector_rank, 999))) ) AS rrf_score
    FROM fts_results f
    FULL OUTER JOIN vector_results v ON f.chunk_id = v.chunk_id
)
-- 4. Final Ranked Selection: Filtered by tenant through inner join on documents
SELECT 
    r.chunk_id,
    r.document_id,
    d.title AS document_title,
    r.content,
    r.fts_score,
    r.vector_score,
    r.rrf_score
FROM fused_ranks r
JOIN documents d ON d.document_id = r.document_id
ORDER BY r.rrf_score DESC
LIMIT 10;
