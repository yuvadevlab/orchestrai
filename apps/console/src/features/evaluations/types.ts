/**
 * @file apps/console/src/features/evaluations/types.ts
 * @description Type definitions for agent benchmark evaluations, datasets, and scoring metrics.
 * @module apps/console/features/evaluations
 */

export interface EvaluationItem {
  id: string;
  prompt: string;
  expectedTools: string[];
  expectedOutputSubstring?: string;
  maxSteps: number;
}

export interface EvaluationDataset {
  name: string;
  description?: string;
  items: EvaluationItem[];
}

export interface BenchmarkResult {
  datasetName: string;
  totalItems: number;
  passedItems: number;
  accuracyPercentage: number;
  meanLatencyMs: number;
}

export interface RunBenchmarkPayload {
  datasetName: string;
  modelName?: string;
}
