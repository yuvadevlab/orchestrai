/**
 * @file packages/runtime/src/engine/orchestrai-runtime.ts
 * @description Master runtime coordinator managing graph execution, checkpointing, rewind, and recovery.
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
import {
  MemoryCheckpointer,
  StateRewindEngine,
  type ICheckpointer,
  type IPersistentCheckpointer,
  type RewindOptions,
  type RewindResult,
} from "@/checkpoint";
import {
  createModelNode,
  createToolEvaluatorNode,
  createToolExecutorNode,
  createApprovalGateNode,
  type RuntimeGraphState,
  type RuntimeNodeDependencies,
} from "@/nodes";
import { ExecutionRecoveryManager } from "@/recovery";
import type { RuntimeEngineConfig } from "./runtime-context";

/**
 * Top-level runtime coordinator executing agent workflows on directed state graphs.
 */
export class OrchestrAIRuntime {
  private readonly checkpointer: IPersistentCheckpointer<RuntimeGraphState>;
  private readonly defaultClearance: ToolPermissionLevel;
  private readonly workspaceRoot?: string;

  public constructor(config: RuntimeEngineConfig = {}) {
    this.checkpointer =
      (config.checkpointer as IPersistentCheckpointer<RuntimeGraphState>) ??
      new MemoryCheckpointer<RuntimeGraphState>();
    this.defaultClearance = config.defaultClearance ?? ToolPermissionLevel.READ_ONLY;
    this.workspaceRoot = config.workspaceRoot;
  }

  /**
   * Compiles the canonical agent execution DAG with the provided runtime dependencies.
   */
  public createAgentGraph(deps: RuntimeNodeDependencies): CompiledGraph<RuntimeGraphState> {
    const graph = new StateGraph<RuntimeGraphState>();

    graph.addNode("model", createModelNode(deps));
    graph.addNode("tool_evaluator", createToolEvaluatorNode(deps));
    graph.addNode("tool_executor", createToolExecutorNode(deps));
    graph.addNode("approval_gate", createApprovalGateNode());

    graph.addEdge(START, "model");

    // After model runs: route to evaluator if tool calls present, else complete
    graph.addConditionalEdge("model", (state) => {
      if (state.pendingToolCalls && state.pendingToolCalls.length > 0) {
        return "tool_evaluator";
      }
      return END;
    });

    // After evaluation: route to approval gate if approval required, else execute tools
    graph.addConditionalEdge("tool_evaluator", (state) => {
      if (state.pendingApprovalId) {
        return "approval_gate";
      }
      return "tool_executor";
    });

    graph.addEdge("approval_gate", END);
    graph.addEdge("tool_executor", "model");

    return graph.compile({ checkpointer: this.checkpointer });
  }

  /**
   * Initiates a new agent execution run from START.
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
      const resumedState: RuntimeGraphState = {
        ...state,
        pendingApprovalId: undefined,
      };
      return compiledGraph.invoke(resumedState, executionId, "tool_executor");
    }

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
   * Rewinds an execution timeline to an earlier checkpoint.
   */
  public async rewind(
    executionId: string,
    options: RewindOptions,
  ): Promise<RewindResult<RuntimeGraphState>> {
    const rewindEngine = new StateRewindEngine(this.checkpointer);
    return rewindEngine.rewind(executionId, options);
  }

  /**
   * Automatically recovers an interrupted or crashed execution run.
   */
  public async recover(
    executionId: string,
    deps: Omit<RuntimeNodeDependencies, "clearance" | "workspaceRoot">,
  ): Promise<RuntimeGraphState> {
    const recoveryManager = new ExecutionRecoveryManager(this.checkpointer);
    const plan = await recoveryManager.planRecovery(executionId);

    // Guard: Prevent resumption if recovery strategy is deemed unrecoverable
    if (plan.strategy === "FAIL_UNRECOVERABLE") {
      throw new OrchestrAIError(
        `Cannot recover execution "${executionId}": ${plan.reason}`,
        "EXECUTION_ERROR",
        422,
        { executionId, plan },
      );
    }

    const resolvedDeps: RuntimeNodeDependencies = {
      ...deps,
      clearance: this.defaultClearance,
      workspaceRoot: this.workspaceRoot,
    };
    const compiledGraph = this.createAgentGraph(resolvedDeps);

    return compiledGraph.invoke(plan.reconstitutedState, executionId, plan.targetResumeNode);
  }

  /**
   * Returns the underlying checkpointer instance.
   */
  public getCheckpointer(): ICheckpointer<RuntimeGraphState> {
    return this.checkpointer;
  }
}
