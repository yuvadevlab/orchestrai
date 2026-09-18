/**
 * @file packages/runtime/src/engine/orchestrai-runtime.ts
 * @description Master runtime coordinator managing graph execution, checkpointing, and HITL resumption.
 *
 * ─── The OrchestrAI Runtime Engine (Learning note) ─────────────────
 * The Runtime coordinates the lifecycle of an agent execution run:
 * 1. Graph Assembly: Wires up Model -> Evaluator -> Executor -> Approval Gate DAG.
 * 2. Start Run: Initializes state, executes graph, and checkpoints progress.
 * 3. Resume Run: When a human approves a paused action, reloads state from
 *    the checkpointer and resumes execution from the exact checkpoint without
 *    repeating previous LLM calls.
 * ───────────────────────────────────────────────────────────────────
 */

import crypto from "node:crypto";
import { MessageRole, ToolPermissionLevel } from "@orchestrai/shared-types";
import {
  AIMessageSchema,
  OrchestrAIError,
  type AIMessage,
  type AgentDefinition,
} from "@orchestrai/core";
import { START, END, StateGraph, type CompiledGraph } from "@/graph";
import { MemoryCheckpointer, type ICheckpointer } from "@/checkpoint";
import {
  createModelNode,
  createToolEvaluatorNode,
  createToolExecutorNode,
  createApprovalGateNode,
  type RuntimeGraphState,
  type RuntimeNodeDependencies,
} from "@/nodes";
import type { RuntimeEngineConfig } from "./runtime-context";

/**
 * Top-level runtime coordinator executing agent workflows on directed state graphs.
 */
export class OrchestrAIRuntime {
  private readonly checkpointer: ICheckpointer<RuntimeGraphState>;
  private readonly defaultClearance: ToolPermissionLevel;
  private readonly workspaceRoot?: string;

  constructor(config: RuntimeEngineConfig = {}) {
    this.checkpointer = config.checkpointer ?? new MemoryCheckpointer<RuntimeGraphState>();
    this.defaultClearance = config.defaultClearance ?? ToolPermissionLevel.READ_ONLY;
    this.workspaceRoot = config.workspaceRoot;
  }

  /**
   * Compiles the canonical agent execution DAG with the provided runtime dependencies.
   */
  public createAgentGraph(deps: RuntimeNodeDependencies): CompiledGraph<RuntimeGraphState> {
    const graph = new StateGraph<RuntimeGraphState>();

    // 1. Add discrete nodes
    graph.addNode("model", createModelNode(deps));
    graph.addNode("tool_evaluator", createToolEvaluatorNode(deps));
    graph.addNode("tool_executor", createToolExecutorNode(deps));
    graph.addNode("approval_gate", createApprovalGateNode());

    // 2. Define static and conditional routing edges
    graph.addEdge(START, "model");

    // After model runs: if tool calls are present, evaluate them; else end
    graph.addConditionalEdge("model", (state) => {
      if (state.pendingToolCalls && state.pendingToolCalls.length > 0) {
        return "tool_evaluator";
      }
      return END;
    });

    // After evaluation: if approval needed, pause at gate; else execute tools
    graph.addConditionalEdge("tool_evaluator", (state) => {
      if (state.pendingApprovalId) {
        return "approval_gate";
      }
      return "tool_executor";
    });

    // Approval gate terminates current traversal round (pauses execution)
    graph.addEdge("approval_gate", END);

    // After tool execution: loop back to model node to reason on results
    graph.addEdge("tool_executor", "model");

    return graph.compile({ checkpointer: this.checkpointer });
  }

  /**
   * Initiates a new agent execution run from START.
   *
   * @param agent - Agent configuration definition.
   * @param history - Initial conversation messages.
   * @param deps - Runtime dependencies (model adapter, tools).
   * @param executionId - Optional existing execution run UUID.
   * @returns Final state snapshot upon completion or pause.
   */
  public async start(
    agent: AgentDefinition,
    history: readonly AIMessage[],
    deps: Omit<RuntimeNodeDependencies, "clearance" | "workspaceRoot">,
    executionId?: string,
  ): Promise<RuntimeGraphState> {
    const runId = executionId ?? crypto.randomUUID();
    const resolvedDeps: RuntimeNodeDependencies = {
      ...deps,
      clearance: this.defaultClearance,
      workspaceRoot: this.workspaceRoot,
    };

    const compiledGraph = this.createAgentGraph(resolvedDeps);

    const initialState: RuntimeGraphState = {
      executionId: runId,
      agent,
      history,
      contextVariables: {},
    };

    return compiledGraph.invoke(initialState, runId, START);
  }

  /**
   * Resumes an execution run that was suspended at an approval gate.
   *
   * @param executionId - Execution run identifier.
   * @param approved - Whether the human operator approved or rejected the action.
   * @param deps - Runtime dependencies.
   * @returns Final state snapshot after resuming execution.
   */
  public async resume(
    executionId: string,
    approved: boolean,
    deps: Omit<RuntimeNodeDependencies, "clearance" | "workspaceRoot">,
  ): Promise<RuntimeGraphState> {
    const latestCheckpoint = await this.checkpointer.loadLatest(executionId);
    if (!latestCheckpoint) {
      throw new OrchestrAIError(
        `Cannot resume execution: no checkpoint found for "${executionId}"`,
        "NOT_FOUND",
        404,
        { executionId },
      );
    }

    const state = latestCheckpoint.state;
    const resolvedDeps: RuntimeNodeDependencies = {
      ...deps,
      clearance: this.defaultClearance,
      workspaceRoot: this.workspaceRoot,
    };

    const compiledGraph = this.createAgentGraph(resolvedDeps);

    if (approved) {
      // Clear approval lock and resume directly into the tool executor
      const resumedState: RuntimeGraphState = {
        ...state,
        pendingApprovalId: undefined,
      };
      return compiledGraph.invoke(resumedState, executionId, "tool_executor");
    }

    // Operator rejected: append refusal message and loop back to model
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
}
