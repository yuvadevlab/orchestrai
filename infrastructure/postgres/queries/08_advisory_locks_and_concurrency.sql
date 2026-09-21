-- ============================================================================
-- Query Handbook: 08_advisory_locks_and_concurrency.sql
-- Description: Session and Transaction-Level PostgreSQL Advisory Locks & 
--              Pessimistic Concurrency Patterns.
-- Business Logic: Guarantees single-worker execution ownership, prevents 
--                 thundering herds, and coordinates distributed sagas.
-- ============================================================================

-- 1. Session-Level Advisory Lock: Explicit lock acquisition by hash key
-- Useful for distributed singleton worker loops or agent execution locks
SELECT pg_try_advisory_lock(hashtext('execution:7f000001-0000-0000-0000-000000000001')) AS lock_acquired;

-- Perform single-agent state transition under session lock protection
UPDATE executions 
SET status = 'RUNNING', updated_at = NOW() 
WHERE execution_id = '7f000001-0000-0000-0000-000000000001'
  AND status = 'PENDING';

-- Explicit release of session-level advisory lock
SELECT pg_advisory_unlock(hashtext('execution:7f000001-0000-0000-0000-000000000001')) AS lock_released;

-- 2. Transaction-Level Advisory Lock: Automatically released upon COMMIT or ROLLBACK
-- Useful for short atomic critical sections during state checkpointing
BEGIN;

SELECT pg_advisory_xact_lock(hashtext('tenant_quota:tenant-1234'));

-- Mutate quota or check concurrency limit safely inside transaction
UPDATE executions 
SET current_step_index = current_step_index + 1, updated_at = NOW()
WHERE execution_id = '7f000001-0000-0000-0000-000000000001';

COMMIT;

-- 3. Concurrent Work Queue Polling: SELECT FOR UPDATE SKIP LOCKED
-- Worker claims PENDING outbox events concurrently without row lock contention
WITH claimed_events AS (
    SELECT event_id
    FROM outbox
    WHERE status = 'PENDING'
    ORDER BY created_at ASC
    LIMIT 25
    FOR UPDATE SKIP LOCKED
)
UPDATE outbox
SET status = 'PUBLISHED', published_at = NOW()
FROM claimed_events
WHERE outbox.event_id = claimed_events.event_id
RETURNING outbox.event_id, outbox.event_type, outbox.payload;
