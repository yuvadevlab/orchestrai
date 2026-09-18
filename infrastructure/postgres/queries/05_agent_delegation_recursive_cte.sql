-- ============================================================================
-- Query 05: Hierarchical Sub-Agent Delegation with Recursive CTEs
-- ============================================================================
--
-- WHY THIS QUERY?
-- Advanced agent workflows (Phase 29 Multi-Agent Orchestration) allow supervisor agents
-- to spawn child and grandchild executions. A recursive CTE traverses the arbitrary
-- depth execution delegation tree to calculate total tree duration and aggregated cost.
--
-- WHY THIS INDEX?
-- Uses expression or GIN index on executions(variables ->> 'parentExecutionId')
-- or index on executions(tenant_id, created_at).
--
-- WHAT IS THE QUERY PLAN?
-- - Non-recursive anchor query evaluates the root execution (Index Scan)
-- - Recursive union evaluates child executions iteratively until no rows remain
-- - WorkTable accumulates the resulting tree structure
--
-- WHAT HAPPENS AT SCALE?
-- Loop depth guards (e.g. depth < 10) prevent infinite recursion loops if circular
-- delegation is inadvertently introduced.

WITH RECURSIVE execution_tree AS (
    -- 1. Anchor Member: Root supervisor execution
    SELECT 
        e.execution_id,
        e.agent_id,
        a.name AS agent_name,
        e.status,
        (e.variables ->> 'parentExecutionId')::UUID AS parent_execution_id,
        1 AS depth,
        ARRAY[e.execution_id] AS path,
        e.created_at,
        e.completed_at
    FROM executions e
    JOIN agents a ON a.agent_id = e.agent_id
    WHERE e.execution_id = '00000000-0000-0000-0000-000000000001'

    UNION ALL

    -- 2. Recursive Member: Descendants spawned by supervisor
    SELECT 
        child.execution_id,
        child.agent_id,
        ca.name AS agent_name,
        child.status,
        (child.variables ->> 'parentExecutionId')::UUID AS parent_execution_id,
        tree.depth + 1 AS depth,
        tree.path || child.execution_id,
        child.created_at,
        child.completed_at
    FROM executions child
    JOIN agents ca ON ca.agent_id = child.agent_id
    JOIN execution_tree tree ON (child.variables ->> 'parentExecutionId')::UUID = tree.execution_id
    -- Guard: Prevent cyclic loops and bounded traversal limit
    WHERE NOT child.execution_id = ANY(tree.path)
      AND tree.depth < 10
)
SELECT 
    depth,
    LPAD('', (depth - 1) * 4, ' ') || agent_name AS hierarchy_visual,
    execution_id,
    parent_execution_id,
    status,
    created_at,
    completed_at
FROM execution_tree
ORDER BY path;
