-- ============================================================================
-- Query 06: Analytics Aggregation with Materialized Views & Concurrent Refresh
-- ============================================================================
--
-- WHY THIS QUERY?
-- Real-time analytics queries calculating token consumption and billing metrics
-- across millions of execution steps impose heavy read load on the primary DB.
-- A Materialized View precomputes the aggregated daily usage by agent and model.
--
-- WHY THIS INDEX?
-- A unique index on (tenant_id, agent_id, model_name, usage_date) is REQUIRED
-- by PostgreSQL to enable `REFRESH MATERIALIZED VIEW CONCURRENTLY`. This guarantees
-- zero-downtime analytics refreshes without acquiring exclusive table locks!
--
-- WHAT IS THE QUERY PLAN?
-- - Select from materialized view: Fast Index Scan or Seq Scan on small summary table.
-- - Refresh: Scans underlying tables with hash aggregation, writes to new relfile, swaps.
--
-- WHAT HAPPENS AT SCALE?
-- Offloads intensive analytics aggregations from the transactional OLTP path.

-- 1. Create Materialized View for Daily Token Consumption
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_agent_token_metrics AS
SELECT 
    e.tenant_id,
    e.agent_id,
    a.name AS agent_name,
    a.model_config ->> 'modelName' AS model_name,
    DATE_TRUNC('day', s.created_at)::DATE AS usage_date,
    COUNT(DISTINCT e.execution_id) AS total_executions,
    SUM(s.tokens_used) AS total_tokens_consumed,
    SUM(s.duration_ms) AS total_duration_ms,
    AVG(s.duration_ms) AS avg_step_duration_ms
FROM execution_steps s
JOIN executions e ON e.execution_id = s.execution_id
JOIN agents a ON a.agent_id = e.agent_id
GROUP BY 
    e.tenant_id,
    e.agent_id,
    a.name,
    a.model_config ->> 'modelName',
    DATE_TRUNC('day', s.created_at)::DATE;

-- 2. Mandatory Unique Index for Non-Blocking Concurrent Refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_agent_token_pk 
ON mv_daily_agent_token_metrics (tenant_id, agent_id, model_name, usage_date);

-- 3. Zero-Downtime Concurrent Refresh (executed via cron or scheduler)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_agent_token_metrics;

-- 4. Fast Query Example for Console Dashboard
SELECT 
    usage_date,
    agent_name,
    model_name,
    total_executions,
    total_tokens_consumed,
    ROUND(total_duration_ms / 1000.0, 2) AS total_duration_seconds
FROM mv_daily_agent_token_metrics
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND usage_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY usage_date DESC, total_tokens_consumed DESC;
