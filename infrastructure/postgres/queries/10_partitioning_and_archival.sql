-- ============================================================================
-- Query Handbook: 10_partitioning_and_archival.sql
-- Description: Temporal Range Partitioning Management, Automated Partition
--              Provisioning, and Archival Maintenance Queries.
-- Business Logic: Manages partition lifecycles for high-volume logs, allowing
--                 instant drop/detach of old data without locking active tables.
-- ============================================================================

-- 1. Automated Partition Creation: Provision partitions for active & future months
CALL create_outbox_partition(CURRENT_DATE);
CALL create_outbox_partition(CURRENT_DATE + INTERVAL '1 month');

-- 2. Querying Across Partitioned Outbox Table
-- Query planner routes query ONLY to matching partition based on created_at filter
SELECT event_id, event_type, status, created_at
FROM outbox_partitioned
WHERE created_at >= '2026-09-01 00:00:00+00'
  AND created_at <  '2026-10-01 00:00:00+00'
  AND status = 'PENDING';

-- 3. Detaching Stale Partition for Archival Storage
-- Instant metadata-only operation without blocking ongoing reads/writes on current partition
-- ALTER TABLE outbox_partitioned DETACH PARTITION outbox_p2026_01;

-- 4. Materialized View Refresh Execution: Periodic Background Refresh
-- Uses unique index idx_mv_tenant_token_telemetry_pk to refresh without write locks
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tenant_token_telemetry;

-- Inspect precomputed token usage telemetry metrics per tenant
SELECT tenant_id, model_name, total_executions, total_tokens, total_duration_ms
FROM mv_tenant_token_telemetry
ORDER BY total_tokens DESC;
