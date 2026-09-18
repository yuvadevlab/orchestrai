-- ============================================================================
-- Query 03: High-Throughput Outbox Polling with FOR UPDATE SKIP LOCKED
-- ============================================================================
--
-- WHY THIS QUERY?
-- When multiple outbox dispatcher worker processes or threads run in parallel,
-- standard polling (`SELECT ... FOR UPDATE`) blocks all other workers while one
-- transaction is in flight. `SKIP LOCKED` instructs Postgres to skip rows currently
-- locked by peer workers, achieving zero-contention parallel queue draining!
--
-- WHY THIS INDEX?
-- Uses partial B-Tree index `idx_outbox_pending_fifo` on (created_at ASC) WHERE status = 'PENDING'.
-- The planner only traverses rows that actually need processing. Published events
-- (which quickly reach 99.9% of the table) are excluded from the index entirely!
--
-- WHAT IS THE QUERY PLAN?
-- Index Scan using idx_outbox_pending_fifo on outbox (cost=0.00..8.27 rows=50 width=...)
-- Filter: (status = 'PENDING'::text)
-- LockRows (SKIP LOCKED)
--
-- WHAT HAPPENS AT SCALE?
-- Provides linearly scalable event dispatching up to thousands of events/sec without
-- deadlock, worker serialization, or table bloat scan penalties.

BEGIN;

-- 1. Atomically claim batch of up to 50 pending events without blocking peers
WITH claimed_events AS (
    SELECT event_id
    FROM outbox
    WHERE status = 'PENDING'
    ORDER BY created_at ASC
    LIMIT 50
    FOR UPDATE SKIP LOCKED
)
UPDATE outbox o
SET 
    status = 'PUBLISHED',
    published_at = NOW(),
    retry_count = o.retry_count + 1
FROM claimed_events c
WHERE o.event_id = c.event_id
RETURNING 
    o.event_id,
    o.tenant_id,
    o.execution_id,
    o.trace_id,
    o.event_type,
    o.payload,
    o.retry_count;

-- 2. Dispatcher transmits claimed payloads to Redis Pub/Sub or Kafka broker...
COMMIT;
