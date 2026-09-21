/**
 * @file eval-dataset.schema.ts
 * @description Zod validation schemas for evaluation datasets and scoring metrics.
 * @module @orchestrai/eval/contracts
 */

import { z } from "zod";

/** Evaluation test item schema */
export const EvaluationItemSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string().min(1),
  expectedTools: z.array(z.string()).default([]),
  expectedOutputSubstring: z.string().optional(),
  maxSteps: z.number().int().positive().default(10),
});
export type EvaluationItem = z.infer<typeof EvaluationItemSchema>;

/** Evaluation dataset schema */
export const EvaluationDatasetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(EvaluationItemSchema),
});
export type EvaluationDataset = z.infer<typeof EvaluationDatasetSchema>;

/** Benchmark scoring result schema */
export const BenchmarkResultSchema = z.object({
  datasetName: z.string(),
  totalItems: z.number().int().nonnegative(),
  passedItems: z.number().int().nonnegative(),
  accuracyPercentage: z.number().min(0).max(100),
  meanLatencyMs: z.number().nonnegative(),
});
export type BenchmarkResult = z.infer<typeof BenchmarkResultSchema>;
