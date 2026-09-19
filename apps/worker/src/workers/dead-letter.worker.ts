/**
 * @file apps/worker/src/workers/dead-letter.worker.ts
 * @description Dedicated background worker processing exhausted dead-letter queue records.
 */

import type { Redis } from "ioredis";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import type { DeadLetterJobPayload } from "@orchestrai/queue";
import { BaseWorker } from "./base.worker";
import { createDeadLetterProcessor, type DeadLetterResult } from "@/processors";

/**
 * Worker configuration for dead-letter processing.
 */
export interface DeadLetterWorkerConfig {
  readonly connection: Redis;
  readonly concurrency?: number;
  readonly logger?: (message: string, meta?: unknown) => void;
}

/**
 * Dedicated consumer for `orchestrai-dead-letter` queue.
 */
export class DeadLetterWorker extends BaseWorker<DeadLetterJobPayload, DeadLetterResult> {
  constructor(config: DeadLetterWorkerConfig) {
    super({
      queueName: QUEUE_NAMES.DEAD_LETTER,
      connection: config.connection,
      processor: createDeadLetterProcessor(config.logger),
      concurrency: config.concurrency ?? 2,
      name: "dead-letter-worker",
    });
  }
}
