/**
 * @file packages/runtime/src/checkpoint/retention/retention-policy.ts
 * @description Configuration schemas and rules governing checkpoint lifecycle and pruning.
 */

import { z } from "zod";

/**
 * Configuration schema for checkpoint retention and timeline compaction.
 */
export const CheckpointRetentionPolicySchema = z.object({
  /** Soft ceiling for total checkpoints retained per execution run */
  maxCheckpointsPerRun: z.number().int().positive().default(50),
  /** Whether to permanently retain critical milestone steps regardless of count */
  preserveMilestones: z.boolean().default(true),
  /** List of node names considered critical milestones that must never be pruned */
  milestoneNodes: z
    .array(z.string())
    .default(["model", "tool_evaluator", "tool_executor", "approval_gate"]),
});

export type CheckpointRetentionPolicy = z.infer<typeof CheckpointRetentionPolicySchema>;
