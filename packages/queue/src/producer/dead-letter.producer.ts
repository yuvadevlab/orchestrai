/**
 * @file packages/queue/src/producer/dead-letter.producer.ts
 * @description Dedicated producer routing poisoned or repeatedly failed tasks to Dead-Letter Queue (DLQ).
 */

import type { Redis } from "ioredis";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import { ValidationError } from "@orchestrai/core";
import { BaseQueueProducer } from "./base-producer";
import { DeadLetterJobPayloadSchema, type DeadLetterJobPayload } from "@/types/job.types";
import type { EnqueueJobOptions } from "@/types/queue.types";

/**
 * Producer for routing exhausted failed jobs to the dead-letter queue for forensic evaluation.
 */
export class DeadLetterProducer extends BaseQueueProducer<DeadLetterJobPayload> {
  public constructor(connection: Redis) {
    super(QUEUE_NAMES.DEAD_LETTER, connection);
  }

  /**
   * Enforces schema correctness on dead-letter forensic payloads.
   */
  protected override validatePayload(raw: unknown): DeadLetterJobPayload {
    const result = DeadLetterJobPayloadSchema.safeParse(raw);
    if (!result.success) {
      throw new ValidationError("Invalid dead letter job payload", result.error.format());
    }
    return result.data;
  }

  /**
   * Enqueues a dead-letter job with zero further retries (one-shot audit record).
   */
  public override async enqueue(
    payload: DeadLetterJobPayload,
    options: EnqueueJobOptions = {},
  ): Promise<string> {
    const dlqOptions: EnqueueJobOptions = {
      ...options,
      maxAttempts: 1, // Do not attempt retries on dead letter records
      removeOnComplete: false, // Retain for forensic inspection
      removeOnFail: false,
    };

    return super.enqueue(payload, dlqOptions);
  }
}
