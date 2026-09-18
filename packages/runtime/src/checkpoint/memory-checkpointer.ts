/**
 * @file packages/runtime/src/checkpoint/memory-checkpointer.ts
 * @description In-memory implementation of ICheckpointer for local execution and testing.
 */

import type { CheckpointRecord } from "./checkpoint.types";
import type { ICheckpointer } from "./checkpointer.interface";

/**
 * Ephemeral in-memory checkpointer storing snapshots in process memory.
 */
export class MemoryCheckpointer<TState = unknown> implements ICheckpointer<TState> {
  private readonly store = new Map<string, CheckpointRecord<TState>[]>();

  /**
   * Persists a checkpoint snapshot to the in-memory array for the execution run.
   */
  public async save(checkpoint: CheckpointRecord<TState>): Promise<void> {
    const list = this.store.get(checkpoint.executionId) ?? [];
    list.push(checkpoint);
    this.store.set(checkpoint.executionId, list);
  }

  /**
   * Retrieves the latest chronological checkpoint for the execution.
   */
  public async loadLatest(executionId: string): Promise<CheckpointRecord<TState> | undefined> {
    const list = this.store.get(executionId);
    if (!list || list.length === 0) {
      return undefined;
    }
    return list[list.length - 1];
  }

  /**
   * Retrieves a specific checkpoint by its checkpoint UUID across all runs.
   */
  public async load(checkpointId: string): Promise<CheckpointRecord<TState> | undefined> {
    for (const list of this.store.values()) {
      const found = list.find((c) => c.checkpointId === checkpointId);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  /**
   * Returns all chronological checkpoints for the given execution ID.
   */
  public async list(executionId: string): Promise<readonly CheckpointRecord<TState>[]> {
    const list = this.store.get(executionId);
    return list ? [...list] : [];
  }

  /**
   * Clears all stored checkpoints from memory.
   */
  public clear(): void {
    this.store.clear();
  }
}
