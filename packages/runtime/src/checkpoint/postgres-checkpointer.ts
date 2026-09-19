/**
 * @file packages/runtime/src/checkpoint/postgres-checkpointer.ts
 * @description Durable PostgreSQL implementation of IPersistentCheckpointer for production execution graphs.
 */

import type { CheckpointRecord } from "./checkpoint.types";
import type { IDatabaseQueryRunner, IPersistentCheckpointer } from "./database-adapter.interface";
import { calculateStateHash } from "./serializer/state-hasher";
import { deserializeState, serializeState } from "./serializer/state-serializer";

/**
 * Raw database row shape returned from the `checkpoints` table.
 */
interface CheckpointDbRow {
  readonly checkpoint_id: string;
  readonly execution_id: string;
  readonly step_index: number;
  readonly node_name: string;
  readonly state: string | Record<string, unknown>;
  readonly created_at: Date | string;
}

/**
 * Durable checkpointer persisting state snapshots to PostgreSQL via atomic UPSERT queries.
 */
export class PostgresCheckpointer<TState = unknown> implements IPersistentCheckpointer<TState> {
  private readonly db: IDatabaseQueryRunner;

  public constructor(db: IDatabaseQueryRunner) {
    this.db = db;
  }

  /**
   * Persists a checkpoint snapshot using idempotent UPSERT on conflict (execution_id, step_index).
   */
  public async save(checkpoint: CheckpointRecord<TState>): Promise<void> {
    const serializedPayload = serializeState(checkpoint.state);
    const createdAt = checkpoint.timestamp ?? new Date();

    const sql = `
      INSERT INTO checkpoints (checkpoint_id, execution_id, step_index, node_name, state, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (execution_id, step_index)
      DO UPDATE SET
        node_name = EXCLUDED.node_name,
        state = EXCLUDED.state,
        created_at = EXCLUDED.created_at;
    `;

    await this.db.query(sql, [
      checkpoint.checkpointId,
      checkpoint.executionId,
      checkpoint.stepIndex,
      checkpoint.nodeName,
      serializedPayload,
      createdAt,
    ]);
  }

  /**
   * Retrieves the most recent chronological checkpoint recorded for an execution run.
   */
  public async loadLatest(executionId: string): Promise<CheckpointRecord<TState> | undefined> {
    const sql = `
      SELECT checkpoint_id, execution_id, step_index, node_name, state, created_at
      FROM checkpoints
      WHERE execution_id = $1
      ORDER BY step_index DESC
      LIMIT 1;
    `;

    const rows = await this.db.query<CheckpointDbRow>(sql, [executionId]);
    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return this.mapRowToRecord(row);
  }

  /**
   * Retrieves a specific checkpoint snapshot by its unique UUID.
   */
  public async load(checkpointId: string): Promise<CheckpointRecord<TState> | undefined> {
    const sql = `
      SELECT checkpoint_id, execution_id, step_index, node_name, state, created_at
      FROM checkpoints
      WHERE checkpoint_id = $1
      LIMIT 1;
    `;

    const rows = await this.db.query<CheckpointDbRow>(sql, [checkpointId]);
    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return this.mapRowToRecord(row);
  }

  /**
   * Returns all chronological checkpoints for an execution run ordered by stepIndex ascending.
   */
  public async list(executionId: string): Promise<readonly CheckpointRecord<TState>[]> {
    const sql = `
      SELECT checkpoint_id, execution_id, step_index, node_name, state, created_at
      FROM checkpoints
      WHERE execution_id = $1
      ORDER BY step_index ASC;
    `;

    const rows = await this.db.query<CheckpointDbRow>(sql, [executionId]);
    return rows.map((r) => this.mapRowToRecord(r));
  }

  /**
   * Deletes all checkpoints strictly following a specified step index for rewinding execution.
   */
  public async deleteAfter(executionId: string, stepIndex: number): Promise<void> {
    const sql = `
      DELETE FROM checkpoints
      WHERE execution_id = $1 AND step_index > $2;
    `;

    await this.db.query(sql, [executionId, stepIndex]);
  }

  /**
   * Prunes non-retained checkpoints for an execution, preserving only milestone steps.
   */
  public async prune(executionId: string, retainStepIndices: number[]): Promise<number> {
    // Guard: If empty array provided, do not prune any steps to prevent accidental data loss
    if (retainStepIndices.length === 0) {
      return 0;
    }

    const sql = `
      DELETE FROM checkpoints
      WHERE execution_id = $1 AND step_index != ALL($2::int[]);
    `;

    const result = await this.db.query<{ count?: number }>(sql, [executionId, retainStepIndices]);
    return result.length;
  }

  /**
   * Maps a raw database row back into a strongly-typed CheckpointRecord with integrity hash.
   */
  private mapRowToRecord(row: CheckpointDbRow): CheckpointRecord<TState> {
    const rawState = typeof row.state === "string" ? row.state : JSON.stringify(row.state);
    const hydratedState = deserializeState<TState>(rawState);
    const stateHash = calculateStateHash(hydratedState);

    return {
      checkpointId: row.checkpoint_id,
      executionId: row.execution_id,
      stepIndex: Number(row.step_index),
      nodeName: row.node_name,
      state: hydratedState,
      stateHash,
      timestamp: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    };
  }
}
