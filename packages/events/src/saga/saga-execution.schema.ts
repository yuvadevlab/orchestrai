/**
 * @file packages/events/src/saga/saga-execution.schema.ts
 * @description Zod schema for serializing and checkpointing Saga execution snapshots.
 */

import { z } from "zod";
import { SagaState } from "./saga.types";

/**
 * Zod schema validating a Saga state enum value.
 */
export const SagaStateSchema = z.nativeEnum(SagaState);

/**
 * Schema validating a Saga execution snapshot for persistence and audit log.
 */
export const SagaExecutionSnapshotSchema = z.object({
  /**
   * Unique execution ID of this saga instance.
   */
  sagaId: z.string().uuid(),

  /**
   * Name of the saga workflow.
   */
  name: z.string().min(1),

  /**
   * Current execution state.
   */
  state: SagaStateSchema,

  /**
   * Zero-indexed step currently or last processed.
   */
  currentStepIndex: z.number().int().nonnegative(),

  /**
   * Step names completed in forward direction.
   */
  completedSteps: z.array(z.string()),

  /**
   * Step names compensated in reverse direction.
   */
  compensatedSteps: z.array(z.string()),

  /**
   * Error string if saga failed or compensation failed.
   */
  error: z.string().optional(),

  /**
   * Timestamp when saga started.
   */
  startedAt: z.string().datetime(),

  /**
   * Timestamp when saga finished or failed.
   */
  finishedAt: z.string().datetime().optional(),
});

export type SagaExecutionSnapshot = z.infer<typeof SagaExecutionSnapshotSchema>;
