-- ============================================================================
-- Query 02: Checkpoint UPSERT & Optimistic State Hydration
-- ============================================================================
--
-- WHY THIS QUERY?
-- Checkpointing happens after every node transition in the execution DAG. If a worker
-- retries a transient failure or encounters duplicate step messages from BullMQ, a plain
-- INSERT will throw unique constraint violations. UPSERT provides idempotent checkpointing.
--
-- WHY THIS INDEX?
-- Uses composite unique index `uq_checkpoint_step` on (execution_id, step_index).
-- PostgreSQL immediately identifies whether the row exists in O(log N) operations.
--
-- WHAT IS THE QUERY PLAN?
-- - Insert on checkpoints (cost=0.00..0.01)
-- - Conflict Resolution: Index Scan using uq_checkpoint_step
--
-- WHAT HAPPENS AT SCALE?
-- Prevents lock contention and race conditions during worker failover or step re-runs.

-- Idempotent Checkpoint Recording
INSERT INTO checkpoints (
    checkpoint_id,
    execution_id,
    step_index,
    node_name,
    state,
    created_at
) VALUES (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    3,
    'ToolExecutorNode',
    jsonb_build_object(
        'executionId', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'currentStepIndex', 3,
        'variables', jsonb_build_object('retries', 1, 'lastAction', 'read_file'),
        'isHalted', false
    ),
    NOW()
)
ON CONFLICT (execution_id, step_index) 
DO UPDATE SET
    node_name = EXCLUDED.node_name,
    state = EXCLUDED.state,
    created_at = EXCLUDED.created_at
RETURNING checkpoint_id, execution_id, step_index, node_name;

-- Hydration Query: Fetch latest checkpoint for worker state recovery
SELECT 
    checkpoint_id,
    execution_id,
    step_index,
    node_name,
    state,
    created_at
FROM checkpoints
WHERE execution_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
ORDER BY step_index DESC
LIMIT 1;
