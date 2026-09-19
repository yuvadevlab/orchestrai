/**
 * @file packages/runtime/src/checkpoint/rewind/state-rewind-engine.ts
 * @description Engine managing state rollbacks, timeline pruning, and branching execution forks.
 */

import { randomUUID } from "node:crypto";
import { OrchestrAIError } from "@orchestrai/core";
import type { CheckpointRecord } from "../checkpoint.types";
import type { IPersistentCheckpointer } from "../database-adapter.interface";
import { type RewindOptions, type RewindResult, RewindOptionsSchema } from "./rewind-policy";

/**
 * Executes state rollbacks and time-travel branch operations across graph executions.
 */
export class StateRewindEngine<TState = unknown> {
  private readonly checkpointer: IPersistentCheckpointer<TState>;

  public constructor(checkpointer: IPersistentCheckpointer<TState>) {
    this.checkpointer = checkpointer;
  }

  /**
   * Rewinds an execution run to a target checkpoint according to the selected policy.
   *
   * @param executionId - Source execution run identifier.
   * @param rawOptions - Target checkpoint criteria and policy configuration.
   * @returns RewindResult containing the restored checkpoint and active execution ID.
   */
  public async rewind(
    executionId: string,
    rawOptions: RewindOptions,
  ): Promise<RewindResult<TState>> {
    const options = RewindOptionsSchema.parse(rawOptions);

    // 1. Locate the target checkpoint snapshot
    const targetCheckpoint = await this.resolveTargetCheckpoint(executionId, options);

    // 2. Handle PRUNE_SUBSEQUENT: Delete newer steps and resume in-place
    if (options.policy === "PRUNE_SUBSEQUENT") {
      await this.checkpointer.deleteAfter(executionId, targetCheckpoint.stepIndex);
      return {
        restoredCheckpoint: targetCheckpoint,
        activeExecutionId: executionId,
        isFork: false,
      };
    }

    // 3. Handle BRANCH_FORK: Copy history up to target step into a new execution fork
    const forkId = options.forkExecutionId ?? randomUUID();
    const allCheckpoints = await this.checkpointer.list(executionId);

    // Filter checkpoints up to the target step index
    const historicalSteps = allCheckpoints.filter((c) => c.stepIndex <= targetCheckpoint.stepIndex);

    let restoredForkCheckpoint: CheckpointRecord<TState> | undefined;

    for (const step of historicalSteps) {
      const isTarget = step.stepIndex === targetCheckpoint.stepIndex;
      const forkRecord: CheckpointRecord<TState> = {
        checkpointId: randomUUID(),
        executionId: forkId,
        stepIndex: step.stepIndex,
        nodeName: step.nodeName,
        state: step.state,
        stateHash: step.stateHash,
        metadata: {
          ...step.metadata,
          forkedFromExecutionId: executionId,
          forkedFromCheckpointId: step.checkpointId,
        },
        timestamp: new Date(),
      };

      await this.checkpointer.save(forkRecord);

      if (isTarget) {
        restoredForkCheckpoint = forkRecord;
      }
    }

    // Guard: Ensure fork target checkpoint was properly persisted
    if (!restoredForkCheckpoint) {
      throw new OrchestrAIError(
        `Failed to create execution fork: target step ${targetCheckpoint.stepIndex} was not copied`,
        "EXECUTION_ERROR",
        500,
        { executionId, forkId },
      );
    }

    return {
      restoredCheckpoint: restoredForkCheckpoint,
      activeExecutionId: forkId,
      isFork: true,
    };
  }

  /**
   * Resolves the target checkpoint snapshot from either stepIndex or checkpointId.
   */
  private async resolveTargetCheckpoint(
    executionId: string,
    options: RewindOptions,
  ): Promise<CheckpointRecord<TState>> {
    // Branch A: Query by specific checkpoint UUID
    if (options.targetCheckpointId) {
      const record = await this.checkpointer.load(options.targetCheckpointId);
      if (!record || record.executionId !== executionId) {
        throw new OrchestrAIError(
          `Checkpoint "${options.targetCheckpointId}" not found for execution "${executionId}"`,
          "NOT_FOUND",
          404,
          { executionId, checkpointId: options.targetCheckpointId },
        );
      }
      return record;
    }

    // Branch B: Query by sequential step index
    if (options.targetStepIndex !== undefined) {
      const list = await this.checkpointer.list(executionId);
      const record = list.find((c) => c.stepIndex === options.targetStepIndex);
      if (!record) {
        throw new OrchestrAIError(
          `Step index ${options.targetStepIndex} not found for execution "${executionId}"`,
          "NOT_FOUND",
          404,
          { executionId, stepIndex: options.targetStepIndex },
        );
      }
      return record;
    }

    throw new OrchestrAIError(
      "Rewind failed: must specify either targetStepIndex or targetCheckpointId",
      "VALIDATION_ERROR",
      400,
      { executionId },
    );
  }
}
