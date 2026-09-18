-- ============================================================================
-- Query 01: Transactional Outbox Pattern (Dual-Write Prevention)
-- ============================================================================
--
-- WHY THIS QUERY?
-- In distributed AI architectures, workers need to update the execution state
-- in PostgreSQL and publish an event to Redis/BullMQ. If the app updates the DB
-- and crashes before publishing to Redis, the system is inconsistent (Dual-Write Bug).
-- By wrapping state update + outbox write in ONE ACID transaction, atomicity is guaranteed.
--
-- WHY THIS INDEX?
-- Uses PK index `executions_pkey` for the execution update (O(log N)).
--
-- WHAT IS THE QUERY PLAN?
-- - Single row index scan on executions
-- - Single row insert into outbox
-- Total runtime: < 1ms
--
-- WHAT HAPPENS AT SCALE?
-- Relieves the database of coordinating with external message queues in the hot loop.
-- The outbox table acts as a write-ahead log buffer.

BEGIN;

-- 1. Transition Execution to COMPLETED
UPDATE executions
SET 
    status = 'COMPLETED',
    completed_at = NOW(),
    updated_at = NOW(),
    variables = jsonb_set(variables, '{outputSummary}', '"Workflow executed successfully"')
WHERE 
    execution_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
    AND status = 'RUNNING';

-- 2. Insert event envelope into transactional outbox in same transaction
INSERT INTO outbox (
    event_id,
    tenant_id,
    execution_id,
    trace_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    status
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'trace-orch-987654321',
    'Execution',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'execution.completed',
    jsonb_build_object(
        'executionId', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'status', 'COMPLETED',
        'completedAt', NOW()
    ),
    'PENDING'
);

COMMIT;
