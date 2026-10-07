/**
 * @file apps/worker/src/jobs/agent/agent-job.handler.ts
 * @description Executes an asynchronous agent execution job using the OrchestrAI DAG runtime.
 */

import crypto from "node:crypto";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { AgentExecutionJobPayloadSchema, type AgentExecutionJobPayload } from "@orchestrai/queue";
import {
  ValidationError,
  OrchestrAIError,
  extractMessageText,
  type AIMessage,
  type AgentDefinition,
} from "@orchestrai/core";
import { MessageRole, ExecutionStatus, ModelProvider, ErrorCode } from "@orchestrai/shared-types";
import { OrchestrAIRuntime, type RuntimeNodeDependencies } from "@orchestrai/runtime";
import type { ILlmAdapter } from "@orchestrai/models";
import type { ToolRegistry } from "@orchestrai/tools";

/** Module-level logger for agent execution job handler */
const logger = loggerWithConfig(new Logger("AgentJobHandler"));

/**
 * Result returned from executing an agent execution job.
 */
export interface AgentJobExecutionResult {
  readonly executionId: string;
  readonly status: ExecutionStatus;
  readonly outputText?: string;
  readonly stepCount: number;
  readonly completedAt: string;
}

/**
 * External dependencies required to execute an agent job.
 */
export interface AgentJobHandlerDependencies {
  readonly runtime: OrchestrAIRuntime;
  readonly toolRegistry: ToolRegistry;
  readonly resolveModelAdapter: (provider?: ModelProvider, modelName?: string) => ILlmAdapter;
  readonly resolveAgentDefinition: (agentId: string, tenantId: string) => Promise<AgentDefinition>;
}

/**
 * Handles processing of a single AgentExecutionJobPayload.
 *
 * @param rawPayload - Raw job data received from BullMQ queue.
 * @param deps - Injected execution dependencies.
 * @returns Execution result snapshot.
 */
export async function handleAgentExecutionJob(
  rawPayload: unknown,
  deps: AgentJobHandlerDependencies,
): Promise<AgentJobExecutionResult> {
  // 1. Validate payload against contract schema — fail fast before any I/O
  const parseResult = AgentExecutionJobPayloadSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    logger.error("handleAgentExecutionJob: invalid job payload", {
      issues: parseResult.error.issues,
    });
    throw new ValidationError(
      "Failed to parse agent execution job payload: " + parseResult.error.message,
      parseResult.error.issues,
    );
  }

  const payload: AgentExecutionJobPayload = parseResult.data;
  logger.info("handleAgentExecutionJob: starting agent execution job", {
    executionId: payload.executionId,
    agentId: payload.agentId,
    tenantId: payload.tenantId,
  });

  // 2. Resolve target agent definition from registry or DB
  const agent = await deps.resolveAgentDefinition(payload.agentId, payload.tenantId);

  // 3. Resolve the configured model adapter
  const modelAdapter = deps.resolveModelAdapter(
    agent.modelConfig?.provider,
    agent.modelConfig?.modelName,
  );

  // 4. Assemble runtime node dependencies for the DAG graph
  const nodeDeps: Omit<RuntimeNodeDependencies, "clearance" | "workspaceRoot"> = {
    adapter: modelAdapter,
    tools: deps.toolRegistry,
  };

  // 5. Construct initial user conversational message
  const initialHistory: readonly AIMessage[] = [
    {
      id: crypto.randomUUID(),
      role: MessageRole.USER,
      content: payload.inputPrompt,
      metadata: {},
      createdAt: new Date(),
    },
  ];

  try {
    // 6. Execute graph DAG via OrchestrAIRuntime — blocking call until DAG resolves
    const finalState = await deps.runtime.start(
      agent,
      initialHistory,
      nodeDeps,
      payload.executionId,
    );

    // 7. Extract the latest assistant message content if available
    const lastMessage = finalState.history[finalState.history.length - 1];
    const outputText = lastMessage ? extractMessageText(lastMessage) : undefined;

    // Check if execution paused waiting for human approval — surface WAITING status
    const status = finalState.pendingApprovalId
      ? ExecutionStatus.WAITING_FOR_APPROVAL
      : ExecutionStatus.COMPLETED;

    logger.info("handleAgentExecutionJob: agent execution completed", {
      executionId: payload.executionId,
      status,
      stepCount: finalState.history.length,
    });

    return {
      executionId: payload.executionId,
      status,
      outputText,
      stepCount: finalState.history.length,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Re-throw domain errors as-is to preserve structured error chain
    if (error instanceof OrchestrAIError) {
      logger.error("handleAgentExecutionJob: domain error during execution", {
        executionId: payload.executionId,
        code: error.code,
        message: error.message,
      });
      throw error;
    }
    // Wrap unexpected errors to maintain domain invariants
    const message = error instanceof Error ? error.message : String(error);
    logger.error("handleAgentExecutionJob: unexpected execution failure", {
      executionId: payload.executionId,
      agentId: payload.agentId,
      message,
    });
    throw new OrchestrAIError(
      `Execution failed for agent '${payload.agentId}' on execution '${payload.executionId}': ${message}`,
      ErrorCode.WORKER_ERROR,
      500,
      { executionId: payload.executionId, agentId: payload.agentId },
    );
  }
}
