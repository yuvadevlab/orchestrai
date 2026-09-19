/**
 * @file apps/worker/src/processors/dead-letter.processor.ts
 * @description BullMQ job processor for inspecting and logging exhausted dead-letter jobs.
 */

import type { Job, Processor } from "bullmq";
import { DeadLetterJobPayloadSchema, type DeadLetterJobPayload } from "@orchestrai/queue";
import { ValidationError } from "@orchestrai/core";
import { createLogger } from "@orchestrai/logger";

const defaultLogger = createLogger("DLQ");

/**
 * Result returned from dead letter processing.
 */
export interface DeadLetterResult {
  readonly recorded: boolean;
  readonly originalQueue: string;
  readonly originalJobId: string;
  readonly processedAt: string;
}

/**
 * Creates a BullMQ processor for dead-letter jobs.
 *
 * @param logger - Optional logging sink for dead-letter alerts.
 * @returns BullMQ-compatible processor function.
 */
export function createDeadLetterProcessor(
  logger: (message: string, meta?: unknown) => void = (msg, meta) => defaultLogger.error(msg, meta),
): Processor<DeadLetterJobPayload, DeadLetterResult, string> {
  return async (
    job: Job<DeadLetterJobPayload, DeadLetterResult, string>,
  ): Promise<DeadLetterResult> => {
    // 1. Validate payload schema
    const parseResult = DeadLetterJobPayloadSchema.safeParse(job.data);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid dead-letter payload: " + parseResult.error.message,
        parseResult.error.issues,
      );
    }

    const payload = parseResult.data;

    // 2. Log forensic diagnostics for operator inspection
    logger(
      `[DLQ-ALERT] Job '${payload.originalJobId}' from queue '${payload.originalQueue}' exhausted all ${payload.attemptsMade} retries:`,
      {
        failedReason: payload.failedReason,
        failedAt: payload.failedAt,
      },
    );

    return {
      recorded: true,
      originalQueue: payload.originalQueue,
      originalJobId: payload.originalJobId,
      processedAt: new Date().toISOString(),
    };
  };
}
