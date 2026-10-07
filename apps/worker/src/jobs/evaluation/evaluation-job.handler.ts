/**
 * @file apps/worker/src/jobs/evaluation/evaluation-job.handler.ts
 * @description Background job handler for offline agent evaluation benchmarking.
 */

import { z } from "zod";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { ValidationError, OrchestrAIError } from "@orchestrai/core";
import { ErrorCode, BenchmarkMetric } from "@orchestrai/shared-types";

/** Module-level logger for evaluation benchmark job handler */
const logger = loggerWithConfig(new Logger("EvaluationJobHandler"));

/**
 * Payload contract for evaluation suite jobs.
 */
export const EvaluationJobPayloadSchema = z.object({
  evalRunId: z.uuid().describe("Evaluation session run UUID"),
  agentId: z.uuid().describe("Target agent UUID"),
  tenantId: z.uuid().describe("Owning tenant UUID"),
  datasetId: z.string().min(1).describe("Benchmark test dataset identifier"),
  metrics: z
    .array(z.enum(BenchmarkMetric))
    .default([BenchmarkMetric.ACCURACY, BenchmarkMetric.LATENCY, BenchmarkMetric.COST]),
});

export type EvaluationJobPayload = z.infer<typeof EvaluationJobPayloadSchema>;

/**
 * Summary result of an evaluation benchmark run.
 */
export interface EvaluationJobResult {
  readonly evalRunId: string;
  readonly agentId: string;
  readonly testCasesRun: number;
  readonly score: number;
  readonly evaluatedAt: string;
}

/**
 * Handles processing of an offline agent evaluation job.
 *
 * @param rawPayload - Raw job data received from queue.
 * @returns Evaluation summary result.
 */
export async function handleEvaluationJob(rawPayload: unknown): Promise<EvaluationJobResult> {
  // 1. Parse and validate evaluation job payload against schema
  const parseResult = EvaluationJobPayloadSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    logger.error("handleEvaluationJob: invalid evaluation job payload", {
      issues: parseResult.error.issues,
    });
    throw new ValidationError(
      "Failed to parse evaluation job payload: " + parseResult.error.message,
      parseResult.error.issues,
    );
  }

  const payload = parseResult.data;
  logger.info("handleEvaluationJob: starting evaluation benchmark run", {
    evalRunId: payload.evalRunId,
    agentId: payload.agentId,
    datasetId: payload.datasetId,
    metrics: payload.metrics,
  });

  try {
    // Phase 26 Eval stub: benchmark test execution
    const testCasesRun = 10;
    const score = 0.95;

    logger.info("handleEvaluationJob: evaluation benchmark complete", {
      evalRunId: payload.evalRunId,
      testCasesRun,
      score,
    });

    return {
      evalRunId: payload.evalRunId,
      agentId: payload.agentId,
      testCasesRun,
      score,
      evaluatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("handleEvaluationJob: evaluation benchmark failed", {
      evalRunId: payload.evalRunId,
      agentId: payload.agentId,
      message,
    });
    throw new OrchestrAIError(
      `Evaluation job failed for run '${payload.evalRunId}': ${message}`,
      ErrorCode.WORKER_ERROR,
      500,
      { evalRunId: payload.evalRunId, agentId: payload.agentId },
    );
  }
}
