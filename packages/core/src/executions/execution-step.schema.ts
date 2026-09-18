/**
 * @file packages/core/src/executions/execution-step.schema.ts
 * @description Granular step representations within an agent execution graph.
 */

import { z } from "zod";
import { StepStatus, StepType } from "@orchestrai/shared-types";
import { ExecutionIdSchema, StepIdSchema } from "@/identifiers";

/**
 * Functional category of an individual execution step backed by StepType enum.
 */
export const StepTypeSchema = z
  .nativeEnum(StepType)
  .describe("Category of action performed during this step");

/**
 * Lifecycle outcome of a step backed by StepStatus enum.
 */
export const StepStatusSchema = z
  .nativeEnum(StepStatus)
  .describe("Processing state of an individual step");

/**
 * Detailed ExecutionStep recording a single discrete unit of agent work.
 */
export const ExecutionStepSchema = z
  .object({
    stepId: StepIdSchema,
    executionId: ExecutionIdSchema,
    stepIndex: z.number().int().nonnegative().describe("Zero-based sequence index within the run"),
    stepType: StepTypeSchema,
    status: StepStatusSchema.default(StepStatus.PENDING),
    name: z.string().min(1).describe("Descriptive name of the step or invoked tool"),
    input: z.unknown().optional().describe("Input parameters, prompt messages, or tool arguments"),
    output: z.unknown().optional().describe("Output result, response chunk, or error payload"),
    durationMs: z
      .number()
      .nonnegative()
      .optional()
      .describe("Total execution duration in milliseconds"),
    error: z.string().optional().describe("Error message if the step status is FAILED"),
    startedAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
  })
  .describe("Record of an individual step executed within an agent graph run");

export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;
