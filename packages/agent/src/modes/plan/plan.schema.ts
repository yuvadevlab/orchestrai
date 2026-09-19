/**
 * @file packages/agent/src/modes/plan/plan.schema.ts
 * @description Zod schemas and TypeScript types defining structured plans, steps, and statuses.
 */

import { z } from "zod";

/**
 * Execution state of a plan step.
 */
export enum PlanStepStatus {
  /** Step has not yet begun execution */
  PENDING = "PENDING",
  /** Step is currently being evaluated or executed */
  IN_PROGRESS = "IN_PROGRESS",
  /** Step completed successfully meeting verification criteria */
  COMPLETED = "COMPLETED",
  /** Step failed during tool execution or verification */
  FAILED = "FAILED",
  /** Step was bypassed due to predecessor failure or dynamic replanning */
  SKIPPED = "SKIPPED",
}

/**
 * Zod schema for PlanStepStatus enum.
 */
export const PlanStepStatusSchema = z
  .nativeEnum(PlanStepStatus)
  .describe("Lifecycle status of an individual execution plan step");

/**
 * Schema for an individual step within an agent's structured execution plan.
 */
export const PlanStepSchema = z
  .object({
    id: z.string().min(1).describe("Unique identifier for this plan step (e.g. step-1, step-2)"),
    title: z.string().min(1).describe("Concise imperative summary of what this step achieves"),
    description: z
      .string()
      .describe("Detailed description of actions, prerequisites, and expected outcomes"),
    toolTarget: z
      .string()
      .optional()
      .describe("Specific tool name expected to be called during this step, if applicable"),
    dependencies: z
      .array(z.string())
      .default([])
      .describe("List of predecessor step IDs that must be completed before this step starts"),
    status: PlanStepStatusSchema.default(PlanStepStatus.PENDING).describe(
      "Current execution status of this step",
    ),
    verificationCriteria: z
      .string()
      .optional()
      .describe("Observable condition or assertion verifying that this step succeeded"),
    resultSummary: z
      .string()
      .optional()
      .describe("Summary of the execution outcome once completed or failed"),
  })
  .strict();

export type PlanStep = z.infer<typeof PlanStepSchema>;

/**
 * Overall status of a multi-step execution plan.
 */
export enum PlanOverallStatus {
  /** Plan is drafted but execution has not begun */
  DRAFT = "DRAFT",
  /** Plan steps are actively being dispatched */
  ACTIVE = "ACTIVE",
  /** All plan steps succeeded */
  COMPLETED = "COMPLETED",
  /** At least one non-optional step failed and halted execution */
  FAILED = "FAILED",
  /** Operator or system cancelled the plan */
  CANCELLED = "CANCELLED",
}

/**
 * Zod schema for PlanOverallStatus enum.
 */
export const PlanOverallStatusSchema = z
  .nativeEnum(PlanOverallStatus)
  .describe("High-level lifecycle status of the entire plan");

/**
 * Schema for a complete structured execution plan generated in PLAN or AUTO mode.
 */
export const PlanSchema = z
  .object({
    planId: z.string().min(1).describe("Unique identifier for this structured plan"),
    goal: z.string().min(1).describe("The overarching user objective or mission this plan solves"),
    steps: z
      .array(PlanStepSchema)
      .min(1)
      .describe("Ordered sequence of steps decomposed from the goal"),
    status: PlanOverallStatusSchema.default(PlanOverallStatus.DRAFT).describe(
      "Current aggregate status of the plan",
    ),
    estimatedSteps: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Estimated number of tool calls or iterations needed"),
    createdAt: z.string().datetime().describe("ISO 8601 creation timestamp"),
    updatedAt: z.string().datetime().describe("ISO 8601 last modification timestamp"),
  })
  .strict();

export type Plan = z.infer<typeof PlanSchema>;
