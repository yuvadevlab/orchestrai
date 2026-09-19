/**
 * @file apps/worker/src/jobs/agent/agent-job.handler.ts
 * @description Executes an asynchronous agent execution job using the OrchestrAI DAG runtime.
 */

import crypto from "node:crypto";
import { AgentExecutionJobPayloadSchema, type AgentExecutionJobPayload } from "@orchestrai/queue";
import {
  ValidationError,
  OrchestrAIError,
  extractMessageText,
  type AIMessage,
  type AgentDefinition,
} from "@orchestrai/core";
import { MessageRole, ExecutionStatus, ModelProvider } from "@orchestrai/shared-types";
import { OrchestrAIRuntime, type RuntimeNodeDependencies } from "@orchestrai/runtime";
import type { ILlmAdapter } from "@orchestrai/models";
import type { ToolRegistry } from "@orchestrai/tools";

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
  readonly resolveModelAdapter: (provider: ModelProvider, modelName: string) => ILlmAdapter;
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
  // 1. Validate payload against contract schema
  const parseResult = AgentExecutionJobPayloadSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    throw new ValidationError(
      "Failed to parse agent execution job payload: " + parseResult.error.message,
      parseResult.error.issues,
    );
  }

  const payload: AgentExecutionJobPayload = parseResult.data;

  // 2. Resolve target agent definition
  const agent = await deps.resolveAgentDefinition(payload.agentId, payload.tenantId);

  // 3. Resolve the configured model adapter
  const modelAdapter = deps.resolveModelAdapter(
    agent.modelConfig.provider,
    agent.modelConfig.modelName,
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
    // 6. Execute graph DAG via OrchestrAIRuntime
    const finalState = await deps.runtime.start(
      agent,
      initialHistory,
      nodeDeps,
      payload.executionId,
    );

    // 7. Extract the latest assistant message content if available
    const lastMessage = finalState.history[finalState.history.length - 1];
    const outputText = lastMessage ? extractMessageText(lastMessage) : undefined;

    // Check if execution paused waiting for human approval
    const status = finalState.pendingApprovalId
      ? ExecutionStatus.WAITING_FOR_APPROVAL
      : ExecutionStatus.COMPLETED;

    return {
      executionId: payload.executionId,
      status,
      outputText,
      stepCount: finalState.history.length,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Wrap unknown failures into OrchestrAIError to maintain domain invariants
    if (error instanceof OrchestrAIError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new OrchestrAIError(
      `Execution failed for agent '${payload.agentId}' on execution '${payload.executionId}': ${message}`,
      "WORKER_ERROR",
      500,
      { executionId: payload.executionId, agentId: payload.agentId },
    );
  }
}
