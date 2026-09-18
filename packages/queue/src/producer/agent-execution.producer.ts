/**
 * @file packages/queue/src/producer/agent-execution.producer.ts
 * @description Dedicated producer for dispatching asynchronous agent workflow runs.
 */

import type { Redis } from "ioredis";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import { ValidationError } from "@orchestrai/core";
import { BaseQueueProducer } from "./base-producer";
import { AgentExecutionJobPayloadSchema, type AgentExecutionJobPayload } from "@/types/job.types";
import type { EnqueueJobOptions } from "@/types/queue.types";

/**
 * High-level producer for dispatching agent execution requests to background worker pools.
 */
export class AgentExecutionProducer extends BaseQueueProducer<AgentExecutionJobPayload> {
  public constructor(connection: Redis) {
    super(QUEUE_NAMES.AGENT_EXECUTION, connection);
  }

  /**
   * Enforces schema correctness on agent execution job payloads.
   */
  protected override validatePayload(raw: unknown): AgentExecutionJobPayload {
    const result = AgentExecutionJobPayloadSchema.safeParse(raw);
    if (!result.success) {
      throw new ValidationError("Invalid agent execution job payload", result.error.format());
    }
    return result.data;
  }

  /**
   * Enqueues an agent execution task with automatic idempotency key mapping.
   *
   * @param payload - Validated agent execution payload.
   * @param options - Optional enqueue parameters.
   * @returns Generated or assigned BullMQ job identifier.
   */
  public override async enqueue(
    payload: AgentExecutionJobPayload,
    options: EnqueueJobOptions = {},
  ): Promise<string> {
    // If client supplied an idempotencyKey and no explicit jobId was provided,
    // bind BullMQ jobId to idempotencyKey for automated deduplication.
    const effectiveJobId = options.jobId ?? payload.idempotencyKey;

    const mergedOptions: EnqueueJobOptions = {
      ...options,
      jobId: effectiveJobId,
      priority: options.priority ?? payload.priority,
    };

    return super.enqueue(payload, mergedOptions);
  }
}
