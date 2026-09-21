/**
 * @file eval-runner.ts
 * @description Evaluation runner scoring agent execution outputs against benchmark datasets.
 * @module @orchestrai/eval/runner
 */

import type { EvaluationDataset, BenchmarkResult } from "../contracts/eval-dataset.schema";

/** Executor function contract for running a single evaluation prompt */
export type EvalExecutor = (prompt: string) => Promise<{
  readonly outputText: string;
  readonly executedTools: readonly string[];
  readonly durationMs: number;
}>;

/**
 * Runner evaluating agent capability against structured benchmark datasets.
 */
export class EvaluationRunner {
  /**
   * Runs evaluation over a dataset using provided execution function.
   *
   * @param dataset - Benchmark dataset containing test items.
   * @param executor - Async executor function invoking agent loop.
   * @returns BenchmarkResult scoring accuracy and latency.
   */
  public async runEvaluation(
    dataset: EvaluationDataset,
    executor: EvalExecutor,
  ): Promise<BenchmarkResult> {
    let passedCount = 0;
    let totalDurationMs = 0;

    for (const item of dataset.items) {
      const startTime = Date.now();

      try {
        const result = await executor(item.prompt);
        const duration = result.durationMs || Date.now() - startTime;
        totalDurationMs += duration;

        // Verify expected tools were called
        const toolsMatched = item.expectedTools.every((tool) =>
          result.executedTools.includes(tool),
        );

        // Verify expected output substring if specified
        const outputMatched = item.expectedOutputSubstring
          ? result.outputText.includes(item.expectedOutputSubstring)
          : true;

        if (toolsMatched && outputMatched) {
          passedCount++;
        }
      } catch {
        // Count failed execution on exception
      }
    }

    const total = dataset.items.length;
    const accuracyPercentage = total > 0 ? (passedCount / total) * 100 : 0;
    const meanLatencyMs = total > 0 ? Math.round(totalDurationMs / total) : 0;

    return {
      datasetName: dataset.name,
      totalItems: total,
      passedItems: passedCount,
      accuracyPercentage,
      meanLatencyMs,
    };
  }
}
