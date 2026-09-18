/**
 * @file packages/queue/src/producer/tool-execution.producer.ts
 * @description Dedicated producer for dispatching asynchronous background tool invocations.
 */

import type { Redis } from "ioredis";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import { ValidationError } from "@orchestrai/core";
import { BaseQueueProducer } from "./base-producer";
import { ToolExecutionJobPayloadSchema, type ToolExecutionJobPayload } from "@/types/job.types";
import type { EnqueueJobOptions } from "@/types/queue.types";

/**
 * Producer for offloading computationally heavy, long-running, or deferred tool calls.
 */
export class ToolExecutionProducer extends BaseQueueProducer<ToolExecutionJobPayload> {
  public constructor(connection: Redis) {
    super(QUEUE_NAMES.TOOL_EXECUTION, connection);
  }

  /**
   * Enforces schema correctness on tool execution job payloads.
   */
  protected override validatePayload(raw: unknown): ToolExecutionJobPayload {
    const result = ToolExecutionJobPayloadSchema.safeParse(raw);
    if (!result.success) {
      throw new ValidationError("Invalid tool execution job payload", result.error.format());
    }
    return result.data;
  }

  /**
   * Enqueues a tool execution task with deterministic step deduplication.
   */
  public override async enqueue(
    payload: ToolExecutionJobPayload,
    options: EnqueueJobOptions = {},
  ): Promise<string> {
    // Default deterministic jobId to executionId:stepId preventing duplicate tool runs
    const defaultJobId = `${payload.executionId}:${payload.stepId}`;

    const mergedOptions: EnqueueJobOptions = {
      jobId: options.jobId ?? defaultJobId,
      ...options,
    };

    return super.enqueue(payload, mergedOptions);
  }
}
