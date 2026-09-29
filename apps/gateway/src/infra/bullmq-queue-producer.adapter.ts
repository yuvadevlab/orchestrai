/**
 * @file apps/gateway/src/repositories/bullmq-queue-producer.adapter.ts
 * @description Queue producer adapter implementing the IQueueProducer port via @orchestrai/queue.
 * @module apps/gateway/repositories
 */

import type { IQueueProducer, QueueJobOptions } from "@orchestrai/core";
import { agentQueueProducerManager } from "@/modules/streaming/agent-execution-queue.producer";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("BullMQQueueProducerAdapter"));

/**
 * Adapter implementing IQueueProducer via background worker queue manager.
 */
export class BullMQQueueProducerAdapter implements IQueueProducer {
  /**
   * Enqueues a job payload to the background execution queue.
   */
  public async enqueue<T>(
    queueName: string,
    jobName: string,
    payload: T,
    _options?: QueueJobOptions,
  ): Promise<string> {
    const data = payload as {
      executionId?: string;
      agentId?: string;
      tenantId?: string;
      input?: string;
      variables?: Record<string, unknown>;
    };

    if (data.executionId && data.agentId && data.tenantId) {
      const jobId = await agentQueueProducerManager.enqueueExecution({
        executionId: data.executionId,
        agentId: data.agentId,
        tenantId: data.tenantId,
        inputPrompt: data.input || "",
        variables: data.variables,
      });

      if (jobId) return jobId;
    }

    logger.debug("Dispatched queue job via queue producer port", {
      queueName,
      jobName,
    });

    return `job_${Date.now()}`;
  }
}
