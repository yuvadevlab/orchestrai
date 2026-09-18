/**
 * @file packages/runtime/src/graph/compiled-graph.ts
 * @description Executable compiled graph runner with automatic checkpointing and edge routing.
 *
 * ─── Executing State Graphs (Learning note for AI Engineers) ─────────
 * The CompiledGraph runner traverses the DAG node-by-node:
 * 1. Executes the node function `fn(state)`
 * 2. Merges state mutations immutably
 * 3. Saves an atomic checkpoint to the `ICheckpointer`
 * 4. Checks if the state flagged a pause (e.g. `pendingApprovalId`)
 * 5. Resolves the next node via static or conditional edge
 * 6. Repeats until reaching the terminal `END` sentinel
 * ───────────────────────────────────────────────────────────────────
 */

import crypto from "node:crypto";
import { OrchestrAIError } from "@orchestrai/core";
import { START, END, type NodeFunction, type EdgeRouter } from "./graph.types";
import type { ICheckpointer } from "@/checkpoint";

/**
 * Configuration options for the compiled graph runner.
 */
export interface CompiledGraphOptions<TState> {
  /** Optional checkpointer for saving state transitions */
  readonly checkpointer?: ICheckpointer<TState>;

  /** Maximum transitions allowed before forced termination (circuit breaker, default: 50) */
  readonly maxTransitions?: number;
}

/**
 * Compiled executable representation of a StateGraph DAG.
 */
export class CompiledGraph<TState extends Record<string, unknown>> {
  private readonly nodes: ReadonlyMap<string, NodeFunction<TState>>;
  private readonly edges: ReadonlyMap<string, string>;
  private readonly conditionalEdges: ReadonlyMap<string, EdgeRouter<TState>>;
  private readonly checkpointer?: ICheckpointer<TState>;
  private readonly maxTransitions: number;

  constructor(
    nodes: ReadonlyMap<string, NodeFunction<TState>>,
    edges: ReadonlyMap<string, string>,
    conditionalEdges: ReadonlyMap<string, EdgeRouter<TState>>,
    options: CompiledGraphOptions<TState> = {},
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.conditionalEdges = conditionalEdges;
    this.checkpointer = options.checkpointer;
    this.maxTransitions = options.maxTransitions ?? 50;
  }

  /**
   * Executes the state graph from START (or a resumption node) to END.
   *
   * @param initialState - Initial state payload.
   * @param executionId - Execution run identifier for checkpointing.
   * @param startNode - Optional node to resume from (defaults to START).
   * @returns Promise resolving to the final state snapshot upon halting or completion.
   */
  public async invoke(
    initialState: TState,
    executionId: string,
    startNode = START,
  ): Promise<TState> {
    let currentState: TState = { ...initialState };
    let currentNode: string = startNode;
    let stepIndex = 0;

    while (currentNode !== END && stepIndex < this.maxTransitions) {
      stepIndex += 1;

      // Case 1: START sentinel entrypoint
      if (currentNode === START) {
        currentNode = await this.resolveNextNode(START, currentState);
        continue;
      }

      // Case 2: Regular execution node
      const nodeFn = this.nodes.get(currentNode);
      if (!nodeFn) {
        throw new OrchestrAIError(
          `Graph execution failed: node "${currentNode}" does not exist`,
          "VALIDATION_ERROR",
          500,
          { nodeName: currentNode, executionId },
        );
      }

      // Execute node logic
      const delta = await nodeFn(currentState);
      if (delta) {
        currentState = { ...currentState, ...delta };
      }

      // Checkpoint state snapshot
      if (this.checkpointer) {
        await this.checkpointer.save({
          checkpointId: crypto.randomUUID(),
          executionId,
          stepIndex,
          nodeName: currentNode,
          state: currentState,
          timestamp: new Date(),
        });
      }

      // Check for pause conditions (e.g. Human-in-the-Loop approval required)
      const hasPendingApproval =
        "pendingApprovalId" in currentState && Boolean(currentState.pendingApprovalId);
      const isTerminated = "isTerminated" in currentState && Boolean(currentState.isTerminated);

      if (hasPendingApproval || isTerminated) {
        // Halt traversal so the execution can pause cleanly
        break;
      }

      // Resolve next node transition
      currentNode = await this.resolveNextNode(currentNode, currentState);
    }

    return currentState;
  }

  /**
   * Resolves the next node for a given source node via static edge or conditional router.
   */
  private async resolveNextNode(source: string, state: TState): Promise<string> {
    // Check static edge first
    const staticTarget = this.edges.get(source);
    if (staticTarget) {
      return staticTarget;
    }

    // Check conditional edge router
    const router = this.conditionalEdges.get(source);
    if (router) {
      return router(state);
    }

    // Default to END if no outgoing edge is defined
    return END;
  }
}
