/**
 * @file apps/worker/src/workers/agent-execution.worker.ts
 * @description Dedicated background worker processing asynchronous agent execution graphs.
 */

import type { Redis } from "ioredis";
import { QUEUE_NAMES } from "@orchestrai/shared-types";
import type { AgentExecutionJobPayload } from "@orchestrai/queue";
import { BaseWorker } from "./base.worker";
import { createAgentExecutionProcessor } from "@/processors";
import type { AgentJobExecutionResult, AgentJobHandlerDependencies } from "@/jobs/agent";

/**
 * Worker configuration for processing the agent execution queue.
 */
export interface AgentExecutionWorkerConfig {
  readonly connection: Redis;
  readonly dependencies: AgentJobHandlerDependencies;
  readonly concurrency?: number;
}

/**
 * Dedicated consumer for `orchestrai-agent-execution` queue.
 */
export class AgentExecutionWorker extends BaseWorker<
  AgentExecutionJobPayload,
  AgentJobExecutionResult
> {
  constructor(config: AgentExecutionWorkerConfig) {
    super({
      queueName: QUEUE_NAMES.AGENT_EXECUTION,
      connection: config.connection,
      processor: createAgentExecutionProcessor(config.dependencies),
      concurrency: config.concurrency ?? 5,
      name: "agent-execution-worker",
    });
  }
}
