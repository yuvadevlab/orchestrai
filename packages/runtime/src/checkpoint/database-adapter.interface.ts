/**
 * @file packages/runtime/src/checkpoint/database-adapter.interface.ts
 * @description Query runner and persistence contracts decoupling checkpointers from concrete database drivers.
 */

import type { ICheckpointer } from "./checkpointer.interface";

/**
 * Minimal query runner abstraction allowing checkpointers to execute raw parameterized SQL queries.
 * Compatible with pg.Pool, postgres.js, and custom transaction wrappers.
 */
export interface IDatabaseQueryRunner {
  /**
   * Executes a parameterized SQL query and returns an array of result rows.
   *
   * @param sql - Parameterized SQL statement with placeholders ($1, $2, etc.).
   * @param params - Optional parameter values corresponding to placeholders.
   * @returns Array of typed rows.
   */
  query<TRow = unknown>(sql: string, params?: unknown[]): Promise<TRow[]>;
}

/**
 * Extended checkpointer contract supporting state deletion, rewinding, and retention pruning.
 */
export interface IPersistentCheckpointer<TState = unknown> extends ICheckpointer<TState> {
  /**
   * Deletes all checkpoints recorded strictly after a given step index for an execution run.
   * Used when rewinding an execution to an earlier point in time.
   *
   * @param executionId - Execution run identifier.
   * @param stepIndex - The cutoff step index (all steps > stepIndex will be deleted).
   */
  deleteAfter(executionId: string, stepIndex: number): Promise<void>;

  /**
   * Prunes non-retained checkpoints for an execution, preserving only the specified step indices.
   *
   * @param executionId - Execution run identifier.
   * @param retainStepIndices - Array of step indices that MUST be retained (milestones).
   * @returns Number of pruned checkpoints.
   */
  prune(executionId: string, retainStepIndices: number[]): Promise<number>;
}
