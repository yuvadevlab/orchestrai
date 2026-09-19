/**
 * @file apps/worker/src/processors/tool-execution.processor.ts
 * @description BullMQ job processor for executing detached background tools.
 */

import type { Job, Processor } from "bullmq";
import { ToolExecutionJobPayloadSchema, type ToolExecutionJobPayload } from "@orchestrai/queue";
import { ValidationError, NotFoundError, ToolExecutionError } from "@orchestrai/core";
import type { ToolRegistry, ToolExecutionContext } from "@orchestrai/tools";

/**
 * Result returned from a detached tool execution job.
 */
export interface ToolJobExecutionResult {
  readonly executionId: string;
  readonly stepId: string;
  readonly toolName: string;
  readonly output: unknown;
  readonly executedAt: string;
}

/**
 * Creates a BullMQ processor for detached tool execution jobs.
 *
 * @param toolRegistry - Injected registry holding executable tools.
 * @returns BullMQ-compatible processor function.
 */
export function createToolExecutionProcessor(
  toolRegistry: ToolRegistry,
): Processor<ToolExecutionJobPayload, ToolJobExecutionResult, string> {
  return async (
    job: Job<ToolExecutionJobPayload, ToolJobExecutionResult, string>,
  ): Promise<ToolJobExecutionResult> => {
    // 1. Validate payload schema
    const parseResult = ToolExecutionJobPayloadSchema.safeParse(job.data);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid tool execution payload: " + parseResult.error.message,
        parseResult.error.issues,
      );
    }

    const payload = parseResult.data;

    // 2. Resolve target tool from registry
    const tool = toolRegistry.get(payload.toolName);
    if (!tool) {
      throw new NotFoundError("Tool", payload.toolName);
    }

    // 3. Assemble tool execution context
    const context: ToolExecutionContext = {
      executionId: payload.executionId,
      metadata: {
        tenantId: payload.tenantId,
        stepId: payload.stepId,
      },
    };

    // 4. Update progress
    await job.updateProgress(25);

    try {
      // 5. Execute tool with arguments
      const output = await tool.execute(payload.toolArguments, context);
      await job.updateProgress(100);

      return {
        executionId: payload.executionId,
        stepId: payload.stepId,
        toolName: payload.toolName,
        output,
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ToolExecutionError(payload.toolName, message, {
        executionId: payload.executionId,
        stepId: payload.stepId,
      });
    }
  };
}
