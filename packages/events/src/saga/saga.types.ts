/**
 * @file packages/events/src/saga/saga.types.ts
 * @description Type definitions and contracts for distributed Saga orchestration with compensating transactions.
 */

/**
 * Execution state of a distributed Saga workflow.
 */
export enum SagaState {
  PENDING = "PENDING",
  EXECUTING = "EXECUTING",
  COMPLETED = "COMPLETED",
  COMPENSATING = "COMPENSATING",
  COMPENSATED = "COMPENSATED",
  FAILED = "FAILED",
}

/**
 * Individual step definition inside a Saga workflow.
 */
export interface SagaStep<TContext> {
  /**
   * Unique name/identifier of this saga step.
   */
  name: string;

  /**
   * Forward execution function updating context or state.
   */
  execute: (context: TContext) => Promise<TContext>;

  /**
   * Inverse compensating function executed if subsequent steps fail.
   */
  compensate: (context: TContext) => Promise<TContext>;
}

/**
 * Definition of a complete multi-step Saga workflow.
 */
export interface SagaDefinition<TContext> {
  /**
   * Unique name of the saga workflow.
   */
  name: string;

  /**
   * Ordered sequence of forward and compensating steps.
   */
  steps: SagaStep<TContext>[];

  /**
   * Initial context passed to the first step.
   */
  initialContext: TContext;
}

/**
 * Summary result returned when a Saga execution finishes.
 */
export interface SagaResult<TContext> {
  /**
   * Final state of the Saga execution.
   */
  state: SagaState;

  /**
   * Final mutated context payload.
   */
  context: TContext;

  /**
   * List of step names that completed forward execution.
   */
  completedSteps: string[];

  /**
   * List of step names that executed compensation.
   */
  compensatedSteps: string[];

  /**
   * Primary execution error if saga failed.
   */
  error?: string;
}
