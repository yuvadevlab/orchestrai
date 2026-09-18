/**
 * @file packages/runtime/src/graph/state-graph.ts
 * @description Fluent builder for constructing directed StateGraph DAGs.
 *
 * ─── The StateGraph Builder Pattern (Learning note) ─────────────────
 * Constructing a graph happens in two phases:
 * 1. Build Phase (`StateGraph`): Nodes, edges, and conditional routers are declared.
 * 2. Execution Phase (`CompiledGraph`): Validates graph integrity (e.g. START exists,
 *    no dangling edges) and produces an executable runner instance.
 * ───────────────────────────────────────────────────────────────────
 */

import { OrchestrAIError } from "@orchestrai/core";
import { START, END, type NodeFunction, type EdgeRouter } from "./graph.types";
import { CompiledGraph, type CompiledGraphOptions } from "./compiled-graph";

/**
 * Directed state graph builder for orchestrating complex agent workflows.
 */
export class StateGraph<TState extends Record<string, unknown>> {
  private readonly nodes = new Map<string, NodeFunction<TState>>();
  private readonly edges = new Map<string, string>();
  private readonly conditionalEdges = new Map<string, EdgeRouter<TState>>();

  /**
   * Registers a discrete execution node within the graph.
   *
   * @param name - Unique node name identifier (cannot be START or END).
   * @param fn - Asynchronous node execution function.
   * @returns This builder instance for chaining.
   */
  public addNode(name: string, fn: NodeFunction<TState>): this {
    if (name === START || name === END) {
      throw new OrchestrAIError(
        `Cannot add node with reserved name "${name}"`,
        "VALIDATION_ERROR",
        400,
        { nodeName: name },
      );
    }

    if (this.nodes.has(name)) {
      throw new OrchestrAIError(
        `Node "${name}" is already registered in this graph`,
        "VALIDATION_ERROR",
        409,
        { nodeName: name },
      );
    }

    this.nodes.set(name, fn);
    return this;
  }

  /**
   * Adds a static directed edge from one node to another.
   *
   * @param from - Source node name (or START).
   * @param to - Target node name (or END).
   */
  public addEdge(from: string, to: string): this {
    if (this.edges.has(from) || this.conditionalEdges.has(from)) {
      throw new OrchestrAIError(
        `Source node "${from}" already has an outgoing edge defined`,
        "VALIDATION_ERROR",
        409,
        { from, to },
      );
    }

    this.edges.set(from, to);
    return this;
  }

  /**
   * Adds a conditional edge that dynamically resolves the target node based on state.
   *
   * @param source - Source node name.
   * @param router - Function returning the next target node name.
   */
  public addConditionalEdge(source: string, router: EdgeRouter<TState>): this {
    if (this.edges.has(source) || this.conditionalEdges.has(source)) {
      throw new OrchestrAIError(
        `Source node "${source}" already has an outgoing edge defined`,
        "VALIDATION_ERROR",
        409,
        { source },
      );
    }

    this.conditionalEdges.set(source, router);
    return this;
  }

  /**
   * Validates graph topology and compiles it into an executable runner.
   *
   * @param options - Optional checkpointer and timeout configuration.
   * @returns Ready-to-execute CompiledGraph instance.
   */
  public compile(options: CompiledGraphOptions<TState> = {}): CompiledGraph<TState> {
    // Invariant: Graph MUST define an outgoing edge from START
    if (!this.edges.has(START) && !this.conditionalEdges.has(START)) {
      throw new OrchestrAIError(
        `Graph compilation failed: missing initial edge from "${START}" entrypoint`,
        "VALIDATION_ERROR",
        400,
      );
    }

    return new CompiledGraph(
      new Map(this.nodes),
      new Map(this.edges),
      new Map(this.conditionalEdges),
      options,
    );
  }
}
