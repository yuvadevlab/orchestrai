/**
 * @file packages/runtime/src/engine/agent-graph-builder.ts
 * @description Graph construction factory that compiles the canonical agent reasoning DAG.
 */

import { START, END, StateGraph, type CompiledGraph } from "@/graph";
import type { ICheckpointer } from "@/checkpoint";
import {
  createModelNode,
  createToolEvaluatorNode,
  createToolExecutorNode,
  createApprovalGateNode,
  type RuntimeGraphState,
  type RuntimeNodeDependencies,
} from "@/nodes";

/**
 * Compiles the canonical agent execution DAG with the provided runtime dependencies.
 *
 * DAG Topology:
 * START -> model -> [has tool calls? -> tool_evaluator | else -> END]
 * tool_evaluator -> [needs approval? -> approval_gate | else -> tool_executor]
 * approval_gate -> END (pauses traversal)
 * tool_executor -> model (loops back to reason on tool results)
 *
 * @param checkpointer - Active checkpointer saving intermediate snapshots.
 * @param deps - Runtime dependencies (model adapter, tools, policy, storage).
 * @returns Executable compiled graph runner.
 */
export function buildAgentGraph(
  checkpointer: ICheckpointer<RuntimeGraphState>,
  deps: RuntimeNodeDependencies,
): CompiledGraph<RuntimeGraphState> {
  const graph = new StateGraph<RuntimeGraphState>();

  // 1. Add discrete nodes
  graph.addNode("model", createModelNode(deps));
  graph.addNode("tool_evaluator", createToolEvaluatorNode(deps));
  graph.addNode("tool_executor", createToolExecutorNode(deps));
  graph.addNode("approval_gate", createApprovalGateNode());

  // 2. Define static and conditional routing edges
  graph.addEdge(START, "model");

  // After model node: route to evaluator if tool calls are present, else complete
  graph.addConditionalEdge("model", (state) => {
    if (state.pendingToolCalls && state.pendingToolCalls.length > 0) {
      return "tool_evaluator";
    }
    return END;
  });

  // After evaluation: route to approval gate if human clearance required, else execute tools
  graph.addConditionalEdge("tool_evaluator", (state) => {
    if (state.pendingApprovalId) {
      return "approval_gate";
    }
    return "tool_executor";
  });

  // Approval gate halts traversal so execution can wait for human review
  graph.addEdge("approval_gate", END);

  // Tool executor loops back to model to synthesize answers from tool results
  graph.addEdge("tool_executor", "model");

  return graph.compile({ checkpointer });
}
