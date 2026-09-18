/**
 * @file packages/runtime/src/checkpoint/checkpointer.interface.ts
 * @description Storage contract for saving, loading, and querying state checkpoints.
 *
 * ─── Checkpointing in AI Agents (Learning note) ────────────────────
 * Large multi-step agent workflows can take minutes or hours (e.g. when waiting
 * for human approval, running slow compilations, or retrying failed networks).
 *
 * Checkpointing provides:
 * 1. Durability: If the server restarts, we reload state and resume from the exact node.
 * 2. Audit Trail: Every step is recorded, enabling post-mortem inspection.
 * 3. Time-Travel Debugging: Replay execution from step 3 without starting over.
 * ───────────────────────────────────────────────────────────────────
 */

import type { CheckpointRecord } from "./checkpoint.types";

/**
 * Universal interface for state checkpoint persistence.
 */
export interface ICheckpointer<TState = unknown> {
  /**
   * Persists an immutable checkpoint snapshot.
   *
   * @param checkpoint - Snapshot record to store.
   */
  save(checkpoint: CheckpointRecord<TState>): Promise<void>;

  /**
   * Retrieves the most recent checkpoint for an execution run.
   *
   * @param executionId - Execution run identifier.
   * @returns Latest CheckpointRecord, or undefined if no checkpoints exist.
   */
  loadLatest(executionId: string): Promise<CheckpointRecord<TState> | undefined>;

  /**
   * Retrieves a specific checkpoint by its unique ID.
   *
   * @param checkpointId - Checkpoint UUID.
   * @returns The CheckpointRecord, or undefined if not found.
   */
  load(checkpointId: string): Promise<CheckpointRecord<TState> | undefined>;

  /**
   * Returns all chronological checkpoints recorded for an execution run.
   *
   * @param executionId - Execution run identifier.
   * @returns Ordered array of checkpoints.
   */
  list(executionId: string): Promise<readonly CheckpointRecord<TState>[]>;
}
