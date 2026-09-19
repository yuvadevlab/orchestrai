/**
 * @file packages/runtime/src/engine/runtime-approval-coordinator.ts
 * @description Dedicated coordinator handling graph resumption, argument overrides, and cancellation for HITL.
 */

import crypto from "node:crypto";
import { MessageRole } from "@orchestrai/shared-types";
import { AIMessageSchema, OrchestrAIError, type AIMessage } from "@orchestrai/core";
import type { IPersistentCheckpointer } from "@/checkpoint";
import {
  ApprovalDecisionEngine,
  type IApprovalStorage,
  type ApprovalResolutionInput,
  type ApprovalTicket,
} from "@/hitl";
import type { RuntimeGraphState, RuntimeNodeDependencies } from "@/nodes";
import { buildAgentGraph } from "./agent-graph-builder";

/**
 * Resumes an execution run that was suspended at an approval gate.
 *
 * @param checkpointer - Active checkpointer saving state transitions.
 * @param executionId - Execution run identifier.
 * @param approved - Whether the operator approved or rejected the action.
 * @param resolvedDeps - Fully resolved runtime node dependencies.
 * @param modifiedArguments - Optional sanitized parameters injected by the operator.
 * @returns Final state snapshot upon completion or next suspension.
 */
export async function resumeApprovalRun(
  checkpointer: IPersistentCheckpointer<RuntimeGraphState>,
  executionId: string,
  approved: boolean,
  resolvedDeps: RuntimeNodeDependencies,
  modifiedArguments?: Readonly<Record<string, unknown>>,
): Promise<RuntimeGraphState> {
  const latest = await checkpointer.loadLatest(executionId);
  if (!latest) {
    throw new OrchestrAIError(
      `Cannot resume execution: no checkpoint found for "${executionId}"`,
      "NOT_FOUND",
      404,
      { executionId },
    );
  }

  const state = latest.state;
  const compiledGraph = buildAgentGraph(checkpointer, resolvedDeps);

  if (approved) {
    let updatedCalls = state.pendingToolCalls;
    // If operator provided sanitized/modified arguments, override the pending tool call
    if (modifiedArguments && updatedCalls && updatedCalls.length > 0) {
      const firstCall = updatedCalls[0];
      if (firstCall) {
        updatedCalls = [{ ...firstCall, arguments: modifiedArguments }, ...updatedCalls.slice(1)];
      }
    }

    const resumedState: RuntimeGraphState = {
      ...state,
      pendingToolCalls: updatedCalls,
      pendingApprovalId: undefined,
    };
    return compiledGraph.invoke(resumedState, executionId, "tool_executor");
  }

  // Handle operator refusal: append feedback message and loop back to model
  const rejectionMessage: AIMessage = AIMessageSchema.parse({
    role: MessageRole.TOOL,
    content: [
      {
        type: "tool_result",
        callId: state.pendingToolCalls?.[0]?.callId ?? "00000000-0000-0000-0000-000000000000",
        isError: true,
        output: { error: "Action rejected by human operator" },
      },
    ],
  });

  const rejectedState: RuntimeGraphState = {
    ...state,
    pendingApprovalId: undefined,
    pendingToolCalls: undefined,
    history: [...state.history, rejectionMessage],
  };

  return compiledGraph.invoke(rejectedState, executionId, "model");
}

/**
 * Cancels an execution currently suspended at an approval gate and records terminal state.
 *
 * @param checkpointer - Active checkpointer saving terminal checkpoint.
 * @param executionId - Target execution run identifier.
 * @param reason - Optional cancellation justification.
 * @returns Cancelled runtime state.
 */
export async function cancelApprovalRun(
  checkpointer: IPersistentCheckpointer<RuntimeGraphState>,
  executionId: string,
  reason?: string,
): Promise<RuntimeGraphState> {
  const latest = await checkpointer.loadLatest(executionId);
  if (!latest) {
    throw new OrchestrAIError(
      `Cannot cancel execution: no checkpoint found for "${executionId}"`,
      "NOT_FOUND",
      404,
      { executionId },
    );
  }

  const cancelledState: RuntimeGraphState = {
    ...latest.state,
    pendingApprovalId: undefined,
    pendingToolCalls: undefined,
    isTerminated: true,
    error: reason ?? "Execution cancelled by operator",
  };

  await checkpointer.save({
    checkpointId: crypto.randomUUID(),
    executionId,
    stepIndex: latest.stepIndex + 1,
    nodeName: "cancelled",
    state: cancelledState,
    timestamp: new Date(),
  });

  return cancelledState;
}

/**
 * Resolves an active approval ticket and automatically coordinates graph resumption or cancellation.
 */
export async function resolveApprovalRun(
  checkpointer: IPersistentCheckpointer<RuntimeGraphState>,
  approvalStorage: IApprovalStorage,
  approvalId: string,
  resolution: ApprovalResolutionInput,
  resolvedDeps: RuntimeNodeDependencies,
): Promise<{ ticket: ApprovalTicket; state: RuntimeGraphState }> {
  const decisionEngine = new ApprovalDecisionEngine(approvalStorage);
  const ticket = await decisionEngine.resolve(approvalId, resolution);

  if (resolution.decision === "CANCELLED") {
    const state = await cancelApprovalRun(checkpointer, ticket.executionId, resolution.reason);
    return { ticket, state };
  }

  const state = await resumeApprovalRun(
    checkpointer,
    ticket.executionId,
    resolution.decision === "APPROVED",
    resolvedDeps,
    ticket.modifiedArguments,
  );
  return { ticket, state };
}
