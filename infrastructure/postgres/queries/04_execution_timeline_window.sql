-- ============================================================================
-- Query 04: Execution Timeline Analysis with CTEs and Window Functions
-- ============================================================================
--
-- WHY THIS QUERY?
-- Debugging agent loops requires analyzing node step progressions, latency spikes,
-- and cumulative token consumption across the execution graph. Window functions
-- compute step-over-step latencies without self-joining the table.
--
-- WHY THIS INDEX?
-- Uses composite index `idx_execution_steps_exec` on (execution_id, step_index ASC).
-- Postgres performs an ordered index scan, avoiding in-memory sort buffers entirely!
--
-- WHAT IS THE QUERY PLAN?
-- - Index Scan using idx_execution_steps_exec on execution_steps
-- - WindowAgg (LAG, SUM, ROW_NUMBER) over step_index partition
--
-- WHAT HAPPENS AT SCALE?
-- Streaming evaluation: WindowAgg computes over the ordered stream in O(N) time
-- and O(1) memory per partition.

WITH step_timeline AS (
    SELECT 
        step_id,
        execution_id,
        step_index,
        node_name,
        status,
        tokens_used,
        duration_ms,
        created_at,
        -- Window 1: Previous step completion timestamp for inter-node latency
        LAG(created_at, 1) OVER (
            PARTITION BY execution_id 
            ORDER BY step_index ASC
        ) AS prev_step_time,
        -- Window 2: Running cumulative token total across the workflow
        SUM(tokens_used) OVER (
            PARTITION BY execution_id 
            ORDER BY step_index ASC 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_tokens,
        -- Window 3: Sequential rank within the execution trace
        ROW_NUMBER() OVER (
            PARTITION BY execution_id 
            ORDER BY step_index ASC
        ) AS timeline_sequence
    FROM execution_steps
    WHERE execution_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
)
SELECT 
    timeline_sequence,
    step_index,
    node_name,
    status,
    tokens_used,
    cumulative_tokens,
    duration_ms,
    created_at,
    -- Compute gap duration between previous node and current node
    COALESCE(
        EXTRACT(EPOCH FROM (created_at - prev_step_time)) * 1000, 
        0
    )::INT AS latency_since_prev_ms
FROM step_timeline
ORDER BY step_index ASC;
