/**
 * @file apps/worker/src/processors/agent-execution.processor.ts
 * @description BullMQ job processor for executing asynchronous agent workflows.
 */

import type { Job, Processor } from "bullmq";
import type { AgentExecutionJobPayload } from "@orchestrai/queue";
import {
  handleAgentExecutionJob,
  type AgentJobExecutionResult,
  type AgentJobHandlerDependencies,
} from "@/jobs/agent";

/**
 * Creates a BullMQ processor for agent execution jobs.
 *
 * @param deps - Injected runtime dependencies for agent DAG execution.
 * @returns BullMQ-compatible processor function.
 */
export function createAgentExecutionProcessor(
  deps: AgentJobHandlerDependencies,
): Processor<AgentExecutionJobPayload, AgentJobExecutionResult, string> {
  return async (
    job: Job<AgentExecutionJobPayload, AgentJobExecutionResult, string>,
  ): Promise<AgentJobExecutionResult> => {
    // 1. Update initial job progress in Redis
    await job.updateProgress(10);

    // 2. Delegate execution to domain job handler
    const result = await handleAgentExecutionJob(job.data, deps);

    // 3. Mark job progress as completed
    await job.updateProgress(100);

    return result;
  };
}
