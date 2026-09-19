/**
 * @file apps/worker/src/jobs/evaluation/evaluation-job.handler.ts
 * @description Background job handler for offline agent evaluation benchmarking.
 */

import { z } from "zod";
import { ValidationError, OrchestrAIError } from "@orchestrai/core";

/**
 * Payload contract for evaluation suite jobs.
 */
export const EvaluationJobPayloadSchema = z.object({
  evalRunId: z.string().uuid().describe("Evaluation session run UUID"),
  agentId: z.string().uuid().describe("Target agent UUID"),
  tenantId: z.string().uuid().describe("Owning tenant UUID"),
  datasetId: z.string().min(1).describe("Benchmark test dataset identifier"),
  metrics: z.array(z.string()).default(["accuracy", "latency", "cost"]),
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
  const parseResult = EvaluationJobPayloadSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    throw new ValidationError(
      "Failed to parse evaluation job payload: " + parseResult.error.message,
      parseResult.error.issues,
    );
  }

  const payload = parseResult.data;

  try {
    // Phase 26 Eval stub: benchmark test execution
    const testCasesRun = 10;
    const score = 0.95;

    return {
      evalRunId: payload.evalRunId,
      agentId: payload.agentId,
      testCasesRun,
      score,
      evaluatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OrchestrAIError(
      `Evaluation job failed for run '${payload.evalRunId}': ${message}`,
      "WORKER_ERROR",
      500,
      { evalRunId: payload.evalRunId, agentId: payload.agentId },
    );
  }
}
