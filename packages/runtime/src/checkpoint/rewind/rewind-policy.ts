/**
 * @file packages/runtime/src/checkpoint/rewind/rewind-policy.ts
 * @description Policies, schemas, and outcome descriptors for execution state rewinding.
 */

import { z } from "zod";
import type { CheckpointRecord } from "../checkpoint.types";

/**
 * Strategy dictating how downstream checkpoints are treated upon rewinding.
 */
export const RewindPolicyTypeSchema = z.enum([
  /** Discard all checkpoints recorded after the rewind step, resuming the existing run in-place */
  "PRUNE_SUBSEQUENT",
  /** Create an entirely new execution fork run preserving the original execution history intact */
  "BRANCH_FORK",
]);

export type RewindPolicyType = z.infer<typeof RewindPolicyTypeSchema>;

/**
 * Target selector options for initiating an execution state rewind.
 */
export const RewindOptionsSchema = z.object({
  /** Step index to rewind back to (mutually exclusive with checkpointId) */
  targetStepIndex: z.number().int().nonnegative().optional(),
  /** Unique UUID of the specific checkpoint to restore */
  targetCheckpointId: z.string().uuid().optional(),
  /** Rewind behavior policy (defaults to PRUNE_SUBSEQUENT) */
  policy: RewindPolicyTypeSchema.default("PRUNE_SUBSEQUENT"),
  /** Custom execution UUID for the branch fork run when using BRANCH_FORK */
  forkExecutionId: z.string().uuid().optional(),
});

export type RewindOptions = z.infer<typeof RewindOptionsSchema>;

/**
 * Result returned upon successful execution state rewind.
 */
export interface RewindResult<TState = unknown> {
  /** The restored checkpoint snapshot that execution will resume from */
  readonly restoredCheckpoint: CheckpointRecord<TState>;
  /** The execution ID to use for subsequent resumption (original run ID or new fork ID) */
  readonly activeExecutionId: string;
  /** Whether a new execution fork branch was created */
  readonly isFork: boolean;
}
