/**
 * @file packages/runtime/src/checkpoint/postgres-checkpoint-queries.ts
 * @description Centralized SQL query catalog and typed row interfaces for execution checkpoint storage.
 * @module @orchestrai/runtime/checkpoint
 */

/**
 * Raw database record structure returned from \`checkpoints\` table queries.
 */
export interface CheckpointDbRow {
  checkpoint_id: string;
  execution_id: string;
  step_index: number;
  node_name: string;
  state: string | Record<string, unknown>;
  created_at: Date | string;
}

/**
 * Master catalog of static SQL queries for execution checkpoints.
 */
export const CHECKPOINT_SQL_QUERIES = {
  /**
   * Persists a checkpoint snapshot using idempotent UPSERT on conflict.
   */
  UPSERT_CHECKPOINT: `
    INSERT INTO checkpoints (checkpoint_id, execution_id, step_index, node_name, state, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (execution_id, step_index)
    DO UPDATE SET
      node_name = EXCLUDED.node_name,
      state = EXCLUDED.state,
      created_at = EXCLUDED.created_at;
  `,

  /**
   * Retrieves the latest chronological checkpoint for an execution run.
   */
  LOAD_LATEST: `
    SELECT checkpoint_id, execution_id, step_index, node_name, state, created_at
    FROM checkpoints
    WHERE execution_id = $1
    ORDER BY step_index DESC
    LIMIT 1;
  `,

  /**
   * Retrieves a checkpoint snapshot by its unique UUID.
   */
  LOAD_BY_ID: `
    SELECT checkpoint_id, execution_id, step_index, node_name, state, created_at
    FROM checkpoints
    WHERE checkpoint_id = $1
    LIMIT 1;
  `,

  /**
   * Returns all chronological checkpoints for an execution run ordered by step index ascending.
   */
  LIST_BY_EXECUTION: `
    SELECT checkpoint_id, execution_id, step_index, node_name, state, created_at
    FROM checkpoints
    WHERE execution_id = $1
    ORDER BY step_index ASC;
  `,

  /**
   * Deletes all checkpoints strictly following a specified step index for rewinding execution.
   */
  DELETE_AFTER_STEP: `
    DELETE FROM checkpoints
    WHERE execution_id = $1 AND step_index > $2;
  `,

  /**
   * Prunes non-retained checkpoints for an execution, preserving only milestone steps.
   */
  PRUNE_CHECKPOINTS: `
    DELETE FROM checkpoints
    WHERE execution_id = $1 AND step_index != ALL($2::int[]);
  `,
} as const;
