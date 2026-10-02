/**
 * @file apps/gateway/src/modules/memory/memory-distillation.ts
 * @description Event-driven memory distillation pipeline extracting semantic facts and episodic learnings on execution completion.
 * @module apps/gateway/modules/memory
 */

import { DomainEventType } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { domainEventBus } from "@/modules/events/domain-event-publisher";
import { memoryService } from "@/modules/memory/memory.service";
import type { DomainEventEnvelope } from "@orchestrai/core";
import { ExecutionCompletedPayloadSchema, ExecutionFailedPayloadSchema } from "@orchestrai/events";
import type { z } from "zod";

type ExecutionCompletedPayload = z.infer<typeof ExecutionCompletedPayloadSchema>;
type ExecutionFailedPayload = z.infer<typeof ExecutionFailedPayloadSchema>;

const logger = loggerWithConfig(new Logger("MemoryDistillation"));

/**
 * Initializes the event-driven memory distillation pipeline.
 * Automatically distills completed and failed executions into persistent episodic & semantic memories.
 */
export function initMemoryDistillation(): void {
  // Distill successful executions into semantic facts & procedures
  domainEventBus.subscribe(
    DomainEventType.EXECUTION_COMPLETED,
    async (event: DomainEventEnvelope) => {
      try {
        const payload = event.payload as ExecutionCompletedPayload;
        const { executionId, output } = payload;
        const tenantId = (event.tenantId as string) || "default";

        if (output && output.trim().length > 30) {
          // Distill concise summary of completed output into semantic knowledge
          const distilledFact = `[Execution ${executionId} Output]: ${output.slice(0, 400).trim()}`;
          await memoryService.storeFact(tenantId, "lead-orchestrator", distilledFact, 0.8);

          logger.info("Distilled execution outcome into semantic memory", {
            executionId,
            factLength: distilledFact.length,
          });
        }
      } catch (err) {
        logger.warn("Memory distillation failed for EXECUTION_COMPLETED", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
  );

  // Distill failed executions into episodic warning notes
  domainEventBus.subscribe(DomainEventType.EXECUTION_FAILED, async (event: DomainEventEnvelope) => {
    try {
      const payload = event.payload as ExecutionFailedPayload;
      const { executionId, error } = payload;
      const tenantId = (event.tenantId as string) || "default";

      if (error && error.trim().length > 0) {
        const failureNote = `[Execution ${executionId} Failure Warning]: Task encountered error "${error.slice(0, 200)}".`;
        await memoryService.storeFact(tenantId, "lead-orchestrator", failureNote, 0.6);

        logger.info("Distilled execution failure into episodic memory", {
          executionId,
          errorPreview: error.slice(0, 80),
        });
      }
    } catch (err) {
      logger.warn("Memory distillation failed for EXECUTION_FAILED", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  logger.info("Memory distillation pipeline initialized on domain event bus");
}
