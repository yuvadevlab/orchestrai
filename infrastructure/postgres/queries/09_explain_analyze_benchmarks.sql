-- ============================================================================
-- Query Handbook: 09_explain_analyze_benchmarks.sql
-- Description: Query Execution Profiling & Performance Analysis Guide using
--              EXPLAIN (ANALYZE, BUFFERS, VERBOSE).
-- Business Logic: Demonstrates index scan, partial index filter, GIN index scan,
--                 and HNSW vector query plan cost metrics and buffer usage.
-- ============================================================================

-- 1. Partial Index Scan Verification: Pending Approval Ticket Lookup
-- Verifies that idx_approvals_pending avoids full table scan on approvals
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT approval_id, tool_name, tool_arguments, requested_at
FROM approvals
WHERE status = 'PENDING'
ORDER BY requested_at ASC;

-- 2. Composite B-Tree Index Scan: Multi-Tenant Execution Timeline Lookup
-- Verifies index hit on idx_executions_tenant_status (tenant_id, status, created_at)
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT execution_id, current_step_index, status, created_at
FROM executions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND status = 'RUNNING'
ORDER BY created_at DESC;

-- 3. GIN Full-Text Search Plan Verification: Document Chunk Keyword Retrieval
-- Verifies GIN bitmap index scan on search_vector column
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT chunk_id, document_id, ts_rank_cd(search_vector, query) AS rank
FROM document_chunks, websearch_to_tsquery('english', 'distributed consistency saga') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 10;

-- 4. HNSW Vector Index Scan Verification: Nearest Neighbor Embedding Search
-- Verifies HNSW index scan using vector_cosine_ops (<=> distance)
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT memory_id, content, (1 - (embedding <=> '[0.12, -0.45, 0.78]'::vector)) AS similarity
FROM memory_items
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[0.12, -0.45, 0.78]'::vector ASC
LIMIT 5;
