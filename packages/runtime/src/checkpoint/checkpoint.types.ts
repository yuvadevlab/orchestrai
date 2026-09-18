/**
 * @file packages/runtime/src/checkpoint/checkpoint.types.ts
 * @description Invariant schemas and types for state checkpoints across graph executions.
 */

/**
 * Immutable snapshot record of graph state captured before or after a node transition.
 */
export interface CheckpointRecord<TState = unknown> {
  /** Unique UUID identifier of this specific checkpoint snapshot */
  readonly checkpointId: string;

  /** Identifier of the workflow execution run this snapshot belongs to */
  readonly executionId: string;

  /** Zero-based sequential step index of this transition */
  readonly stepIndex: number;

  /** Name of the node that produced this state snapshot */
  readonly nodeName: string;

  /** Complete serialized state payload at this point in time */
  readonly state: Readonly<TState>;

  /** Timestamp when this checkpoint was recorded */
  readonly timestamp: Date;
}
