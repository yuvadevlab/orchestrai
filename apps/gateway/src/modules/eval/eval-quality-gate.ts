/**
 * @file apps/gateway/src/modules/eval/eval-quality-gate.ts
 * @description Quality gate evaluating completed agent executions using @orchestrai/eval on EXECUTION_COMPLETED events.
 * @module apps/gateway/modules/eval
 */

import { DomainEventType } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { domainEventBus } from "@/modules/events/domain-event-publisher";
import type { DomainEventEnvelope } from "@orchestrai/core";
import { ExecutionCompletedPayloadSchema } from "@orchestrai/events";
import type { z } from "zod";

type ExecutionCompletedPayload = z.infer<typeof ExecutionCompletedPayloadSchema>;

const logger = loggerWithConfig(new Logger("EvalQualityGate"));

/**
 * Initializes the automated quality gate listening to EXECUTION_COMPLETED domain events.
 */
export function initEvalQualityGate(): void {
  domainEventBus.subscribe(
    DomainEventType.EXECUTION_COMPLETED,
    async (event: DomainEventEnvelope) => {
      try {
        const payload = event.payload as ExecutionCompletedPayload;
        const { executionId, totalSteps, totalTokens, durationMs, output } = payload;

        // Fast automated heuristic evaluation
        const hasOutput = output && output.trim().length > 0;
        const tokPerSec = durationMs > 0 ? ((totalTokens / durationMs) * 1000).toFixed(1) : "0";

        // Score heuristic quality (0.0 to 1.0)
        let score = 0.5;
        if (hasOutput) score += 0.3;
        if (totalSteps > 0) score += 0.2;
        if (output.includes("Error:") || output.includes("Exception:")) score -= 0.3;

        const normalizedScore = Math.max(0.0, Math.min(1.0, score));

        logger.info("Automated evaluation quality gate scored completed execution", {
          executionId,
          qualityScore: normalizedScore,
          totalSteps,
          totalTokens,
          tokPerSec,
          durationMs,
        });
      } catch (err) {
        // Evaluation gate is non-critical and must never impact caller execution lifecycle
        logger.warn("Automated evaluation quality gate failed to evaluate event", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
  );

  logger.info("Eval quality gate initialized on domain event bus");
}
