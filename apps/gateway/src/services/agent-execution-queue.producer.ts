/**
 * @file apps/gateway/src/services/agent-execution-queue.producer.ts
 * @description Bridges gateway execution requests to the background worker pool via BullMQ.
 * @module apps/gateway/services
 */

import { Redis } from "ioredis";
import { AgentExecutionProducer, JobPriority } from "@orchestrai/queue";
import type { ExecutionId, AgentId, TenantId, TraceId } from "@orchestrai/core";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("AgentQueueProducer"));

class AgentQueueProducerManager {
  private producer: AgentExecutionProducer | null = null;
  private redisClient: Redis | null = null;

  constructor() {
    this.initProducer();
  }

  private initProducer(): void {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });

      this.producer = new AgentExecutionProducer(this.redisClient);
      logger.info("Initialized BullMQ AgentExecutionProducer for background workloads");
    } catch (err) {
      logger.warn("Failed to initialize BullMQ AgentExecutionProducer", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Enqueues an execution task into BullMQ for processing by background workers.
   */
  public async enqueueExecution(payload: {
    executionId: string;
    agentId: string;
    tenantId: string;
    inputPrompt: string;
    variables?: Record<string, unknown>;
  }): Promise<string | null> {
    if (!this.producer) {
      logger.warn("Queue producer unavailable; job could not be enqueued to BullMQ");
      return null;
    }

    try {
      const traceId = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const jobId = await this.producer.enqueue({
        executionId: payload.executionId as ExecutionId,
        agentId: payload.agentId as AgentId,
        tenantId: payload.tenantId as TenantId,
        traceId: traceId as TraceId,
        inputPrompt: payload.inputPrompt,
        variables: payload.variables ?? {},
        priority: JobPriority.NORMAL,
        enqueuedAt: new Date().toISOString(),
      });
      logger.info(`Dispatched execution '${payload.executionId}' to BullMQ job '${jobId}'`);
      return jobId;
    } catch (err) {
      logger.error("Failed to enqueue job to BullMQ", {
        executionId: payload.executionId,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }
}

export const agentQueueProducerManager = new AgentQueueProducerManager();
