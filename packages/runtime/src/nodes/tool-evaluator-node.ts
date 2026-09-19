/**
 * @file packages/runtime/src/nodes/tool-evaluator-node.ts
 * @description Permission evaluation and HITL approval detection node with automated ticket creation.
 */

import crypto from "node:crypto";
import { requiresHumanApproval } from "@orchestrai/core";
import { ApprovalStatus, ToolPermissionLevel } from "@orchestrai/shared-types";
import type { NodeFunction } from "@/graph";
import type { RuntimeGraphState, RuntimeNodeDependencies } from "./node.types";

/**
 * Creates the ToolEvaluatorNode handler.
 * Evaluates in-flight tool calls and sets `pendingApprovalId` if human clearance is required.
 *
 * @param deps - Runtime dependencies (tools, permissions, policy, storage).
 * @returns NodeFunction evaluating clearance for pending tool calls.
 */
export function createToolEvaluatorNode(
  deps: RuntimeNodeDependencies,
): NodeFunction<RuntimeGraphState> {
  return async (state: Readonly<RuntimeGraphState>): Promise<Partial<RuntimeGraphState>> => {
    const calls = state.pendingToolCalls ?? [];
    const clearance = deps.clearance ?? ToolPermissionLevel.READ_ONLY;

    for (const call of calls) {
      const tool = deps.tools.get(call.toolName);
      if (!tool) {
        continue;
      }

      let requiresApproval: boolean;
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "HIGH";
      let timeoutMs = 900_000;
      let rationale = `Tool "${call.toolName}" requires human clearance`;

      // 1. Evaluate via ApprovalPolicyEngine if configured
      if (deps.approvalPolicy) {
        const assessment = deps.approvalPolicy.evaluateToolCall(
          call.toolName,
          tool.definition.permissionLevel,
          tool.definition.isDestructive,
          clearance,
        );
        requiresApproval = assessment.requiresApproval;
        riskLevel = assessment.riskLevel;
        timeoutMs = assessment.timeoutMs;
        rationale = assessment.rationale;
      } else {
        // Fallback: Default to core requiresHumanApproval threshold
        requiresApproval = requiresHumanApproval(tool.definition.permissionLevel);
      }

      // 2. If clearance required, generate ticket and pause execution
      if (requiresApproval) {
        const approvalId = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + timeoutMs);

        // Persist ticket into storage if an adapter was provided
        if (deps.approvalStorage) {
          await deps.approvalStorage.createTicket({
            approvalId,
            executionId: state.executionId,
            stepIndex: 0,
            toolName: call.toolName,
            toolArguments: (call.arguments as Record<string, unknown>) ?? {},
            riskLevel,
            rationale,
            status: ApprovalStatus.PENDING,
            requestedAt: now,
            expiresAt,
          });
        }

        return {
          pendingApprovalId: approvalId,
        };
      }
    }

    return {
      pendingApprovalId: undefined,
    };
  };
}
