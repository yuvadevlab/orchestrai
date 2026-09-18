/**
 * @file packages/runtime/src/nodes/approval-gate-node.ts
 * @description Human-in-the-Loop (HITL) approval gate node suspending execution.
 */

import type { NodeFunction } from "@/graph";
import type { RuntimeGraphState } from "./node.types";

/**
 * Creates the ApprovalGateNode handler.
 * Serves as the suspension checkpoint for execution runs awaiting human operator approval.
 */
export function createApprovalGateNode(): NodeFunction<RuntimeGraphState> {
  return async (state: Readonly<RuntimeGraphState>): Promise<Partial<RuntimeGraphState>> => {
    // When execution reaches this node, pendingApprovalId is already populated
    // The graph runner will inspect pendingApprovalId and pause traversal
    return {
      pendingApprovalId: state.pendingApprovalId,
    };
  };
}
