/**
 * @file packages/runtime/src/engine/orchestrai-runtime.ts
 * @description Master runtime coordinator managing DAG execution, HITL approvals, rewind, and recovery.
 */

import crypto from "node:crypto";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import { OrchestrAIError, type AIMessage, type AgentDefinition } from "@orchestrai/core";
import { START, type CompiledGraph } from "@/graph";
import {
  MemoryCheckpointer,
  StateRewindEngine,
  type ICheckpointer,
  type IPersistentCheckpointer,
  type RewindOptions,
  type RewindResult,
} from "@/checkpoint";
import {
  MemoryApprovalStorage,
  type IApprovalStorage,
  type ApprovalPolicyEngine,
  type ApprovalResolutionInput,
  type ApprovalTicket,
} from "@/hitl";
import type { RuntimeGraphState, RuntimeNodeDependencies } from "@/nodes";
import { ExecutionRecoveryManager } from "@/recovery";
import { buildAgentGraph } from "./agent-graph-builder";
import {
  cancelApprovalRun,
  resolveApprovalRun,
  resumeApprovalRun,
} from "./runtime-approval-coordinator";
import type { RuntimeEngineConfig } from "./runtime-context";

/**
 * Top-level runtime coordinator executing agent workflows on directed state graphs.
 */
export class OrchestrAIRuntime {
  private readonly checkpointer: IPersistentCheckpointer<RuntimeGraphState>;
  private readonly approvalStorage: IApprovalStorage;
  private readonly approvalPolicy?: ApprovalPolicyEngine;
  private readonly defaultClearance: ToolPermissionLevel;
  private readonly workspaceRoot?: string;

  public constructor(config: RuntimeEngineConfig = {}) {
    this.checkpointer =
      (config.checkpointer as IPersistentCheckpointer<RuntimeGraphState>) ??
      new MemoryCheckpointer<RuntimeGraphState>();
    this.approvalStorage = config.approvalStorage ?? new MemoryApprovalStorage();
    this.approvalPolicy = config.approvalPolicy;
    this.defaultClearance = config.defaultClearance ?? ToolPermissionLevel.READ_ONLY;
    this.workspaceRoot = config.workspaceRoot;
  }

  /**
   * Compiles the canonical agent execution DAG with provided dependencies.
   */
  public createAgentGraph(deps: RuntimeNodeDependencies): CompiledGraph<RuntimeGraphState> {
    return buildAgentGraph(this.checkpointer, deps);
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
    const resolvedDeps = this.resolveDeps(deps);
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
    modifiedArguments?: Readonly<Record<string, unknown>>,
  ): Promise<RuntimeGraphState> {
    const resolvedDeps = this.resolveDeps(deps);
    return resumeApprovalRun(
      this.checkpointer,
      executionId,
      approved,
      resolvedDeps,
      modifiedArguments,
    );
  }

  /**
   * Resolves an active approval ticket and automatically resumes the execution graph.
   */
  public async resolveApproval(
    approvalId: string,
    resolution: ApprovalResolutionInput,
    deps: Omit<RuntimeNodeDependencies, "clearance" | "workspaceRoot">,
  ): Promise<{ ticket: ApprovalTicket; state: RuntimeGraphState }> {
    const resolvedDeps = this.resolveDeps(deps);
    return resolveApprovalRun(
      this.checkpointer,
      this.approvalStorage,
      approvalId,
      resolution,
      resolvedDeps,
    );
  }

  /**
   * Cancels an execution currently suspended at an approval gate.
   */
  public async cancel(executionId: string, reason?: string): Promise<RuntimeGraphState> {
    return cancelApprovalRun(this.checkpointer, executionId, reason);
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

    if (plan.strategy === "FAIL_UNRECOVERABLE") {
      throw new OrchestrAIError(
        `Cannot recover execution "${executionId}": ${plan.reason}`,
        "EXECUTION_ERROR",
        422,
        { executionId, plan },
      );
    }

    const resolvedDeps = this.resolveDeps(deps);
    const compiledGraph = this.createAgentGraph(resolvedDeps);

    return compiledGraph.invoke(plan.reconstitutedState, executionId, plan.targetResumeNode);
  }

  /**
   * Resolves complete dependencies including workspace clearance, policy, and storage.
   */
  private resolveDeps(
    deps: Omit<RuntimeNodeDependencies, "clearance" | "workspaceRoot">,
  ): RuntimeNodeDependencies {
    return {
      ...deps,
      clearance: this.defaultClearance,
      workspaceRoot: this.workspaceRoot,
      approvalStorage: this.approvalStorage,
      approvalPolicy: this.approvalPolicy,
    };
  }

  /**
   * Returns the underlying checkpointer instance.
   */
  public getCheckpointer(): ICheckpointer<RuntimeGraphState> {
    return this.checkpointer;
  }

  /**
   * Returns the underlying approval storage instance.
   */
  public getApprovalStorage(): IApprovalStorage {
    return this.approvalStorage;
  }
}
