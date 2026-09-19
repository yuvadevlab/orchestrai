/**
 * @file packages/runtime/src/checkpoint/memory-checkpointer.ts
 * @description In-memory implementation of IPersistentCheckpointer for local execution, rewinds, and tests.
 */

import type { CheckpointRecord } from "./checkpoint.types";
import type { IPersistentCheckpointer } from "./database-adapter.interface";
import { calculateStateHash } from "./serializer/state-hasher";

/**
 * Ephemeral in-memory checkpointer storing snapshots in process memory with rewinding support.
 */
export class MemoryCheckpointer<TState = unknown> implements IPersistentCheckpointer<TState> {
  private readonly store = new Map<string, CheckpointRecord<TState>[]>();

  /**
   * Persists a checkpoint snapshot to the in-memory array for the execution run.
   */
  public async save(checkpoint: CheckpointRecord<TState>): Promise<void> {
    const list = this.store.get(checkpoint.executionId) ?? [];
    const stateHash = checkpoint.stateHash ?? calculateStateHash(checkpoint.state);

    const recordWithHash: CheckpointRecord<TState> = {
      ...checkpoint,
      stateHash,
    };

    // Replace if stepIndex already exists (idempotent upsert), else append
    const existingIndex = list.findIndex((c) => c.stepIndex === checkpoint.stepIndex);
    if (existingIndex >= 0) {
      list[existingIndex] = recordWithHash;
    } else {
      list.push(recordWithHash);
      list.sort((a, b) => a.stepIndex - b.stepIndex);
    }

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
   * Deletes all checkpoints strictly following a specified step index for rewinding execution.
   */
  public async deleteAfter(executionId: string, stepIndex: number): Promise<void> {
    const list = this.store.get(executionId);
    if (!list) {
      return;
    }

    const filtered = list.filter((c) => c.stepIndex <= stepIndex);
    this.store.set(executionId, filtered);
  }

  /**
   * Prunes non-retained checkpoints for an execution, preserving only milestone steps.
   */
  public async prune(executionId: string, retainStepIndices: number[]): Promise<number> {
    const list = this.store.get(executionId);
    // Guard: Return 0 if no checkpoints or empty retain list provided
    if (!list || retainStepIndices.length === 0) {
      return 0;
    }

    const retainSet = new Set(retainStepIndices);
    const beforeCount = list.length;
    const filtered = list.filter((c) => retainSet.has(c.stepIndex));
    this.store.set(executionId, filtered);

    return beforeCount - filtered.length;
  }

  /**
   * Clears all stored checkpoints from memory.
   */
  public clear(): void {
    this.store.clear();
  }
}
