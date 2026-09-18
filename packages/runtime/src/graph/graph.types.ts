/**
 * @file packages/runtime/src/graph/graph.types.ts
 * @description Master type definitions and constants for the StateGraph DAG engine.
 *
 * ─── The StateGraph Pattern (Learning note for AI Engineers) ─────────
 * Modern agent frameworks (like LangGraph and OrchestrAI) structure execution
 * as a Directed Acyclic Graph (DAG) or cyclic state machine:
 *
 * 1. Nodes are pure asynchronous functions: `(state) => Promise<Partial<state>>`.
 *    Each node receives the current state, performs a task (e.g. call LLM, run tool),
 *    and returns the state delta to merge back.
 *
 * 2. Edges define directed transitions between nodes:
 *    - Static edges: Node A always flows to Node B.
 *    - Conditional edges: A router function `(state) => string` examines state
 *      and dynamically returns the next target node name (or the terminal `END`).
 *
 * 3. START and END are special sentinel nodes marking graph entry and exit.
 * ───────────────────────────────────────────────────────────────────
 */

/** Special sentinel node marking the entry point of graph execution */
export const START = "__start__";

/** Special sentinel node marking the conclusion of graph execution */
export const END = "__end__";

/**
 * A discrete execution step function within a StateGraph.
 * Receives the current state and returns a state update delta (or void if unchanged).
 */
export type NodeFunction<TState> = (state: Readonly<TState>) => Promise<Partial<TState> | void>;

/**
 * A conditional edge router function that dynamically determines the next node.
 * Evaluates the updated state and returns the target node name or END.
 */
export type EdgeRouter<TState> = (state: Readonly<TState>) => string | Promise<string>;

/**
 * Definition of a conditional edge connecting a source node to a dynamic target.
 */
export interface ConditionalEdge<TState> {
  readonly source: string;
  readonly router: EdgeRouter<TState>;
}

/**
 * Snapshot of a single node transition during graph execution.
 */
export interface StepTransition<TState> {
  readonly nodeName: string;
  readonly stateSnapshot: Readonly<TState>;
  readonly durationMs: number;
}
