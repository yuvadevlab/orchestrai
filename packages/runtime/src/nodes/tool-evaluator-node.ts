/**
 * @file packages/runtime/src/nodes/tool-evaluator-node.ts
 * @description Permission evaluation and HITL approval detection node.
 */

import crypto from "node:crypto";
import { requiresHumanApproval } from "@orchestrai/core";
import type { NodeFunction } from "@/graph";
import type { RuntimeGraphState, RuntimeNodeDependencies } from "./node.types";

/**
 * Creates the ToolEvaluatorNode handler.
 * Evaluates in-flight tool calls and sets `pendingApprovalId` if human clearance is required.
 *
 * @param deps - Runtime dependencies (tools, permissions).
 * @returns NodeFunction evaluating clearance for pending tool calls.
 */
export function createToolEvaluatorNode(
  deps: RuntimeNodeDependencies,
): NodeFunction<RuntimeGraphState> {
  return async (state: Readonly<RuntimeGraphState>): Promise<Partial<RuntimeGraphState>> => {
    const calls = state.pendingToolCalls ?? [];

    for (const call of calls) {
      const tool = deps.tools.get(call.toolName);
      // If tool is classified as DANGEROUS, trigger HITL requirement
      if (tool && requiresHumanApproval(tool.definition.permissionLevel)) {
        const approvalId = crypto.randomUUID();
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
