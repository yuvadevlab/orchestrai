/**
 * @file apps/worker/src/workers/tool-execution.worker.ts
 * @description Dedicated background worker processing detached tool executions.
 */

import type { Redis } from "ioredis";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import type { ToolExecutionJobPayload } from "@orchestrai/queue";
import type { ToolRegistry } from "@orchestrai/tools";
import { BaseWorker } from "./base.worker";
import { createToolExecutionProcessor, type ToolJobExecutionResult } from "@/processors";

/**
 * Worker configuration for processing the tool execution queue.
 */
export interface ToolExecutionWorkerConfig {
  readonly connection: Redis;
  readonly toolRegistry: ToolRegistry;
  readonly concurrency?: number;
}

/**
 * Dedicated consumer for `orchestrai-tool-execution` queue.
 */
export class ToolExecutionWorker extends BaseWorker<
  ToolExecutionJobPayload,
  ToolJobExecutionResult
> {
  constructor(config: ToolExecutionWorkerConfig) {
    super({
      queueName: QUEUE_NAMES.TOOL_EXECUTION,
      connection: config.connection,
      processor: createToolExecutionProcessor(config.toolRegistry),
      concurrency: config.concurrency ?? 10,
      name: "tool-execution-worker",
    });
  }
}
