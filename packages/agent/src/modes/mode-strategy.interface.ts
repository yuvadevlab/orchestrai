/**
 * @file packages/agent/src/modes/mode-strategy.interface.ts
 * @description Contract for agent operating mode strategies (CHAT, PLAN, ACT, AUTO).
 *
 * ─── Agent Modes in AI Engineering (Learning note) ─────────────────
 * Different tasks require fundamentally different agent behaviors:
 * 1. CHAT: Direct user interaction; tools are only used if the user explicitly asks.
 * 2. PLAN: The agent must NOT execute tools immediately. It must analyze the problem,
 *    decompose it into numbered tasks, and produce a structured plan first.
 * 3. ACT: The agent minimizes conversational chit-chat and directly executes tools
 *    towards the goal until completion.
 * 4. AUTO: An adaptive orchestrator that evaluates complexity — producing plans
 *    when needed, executing actions, and verifying results.
 *
 * The Strategy Pattern allows us to swap these behaviors dynamically without
 * polluting the core execution loop with messy `if/else` ladders.
 * ───────────────────────────────────────────────────────────────────
 */

import { AgentMode } from "@orchestrai/shared-types";
import type { ITool } from "@orchestrai/tools";

/**
 * Interface that all operating mode strategies must implement.
 */
export interface IModeStrategy {
  /** The specific AgentMode this strategy manages */
  readonly mode: AgentMode;

  /**
   * Generates mode-specific system instructions to append to the prompt.
   *
   * @returns Guidance string injected by the prompt compiler.
   */
  getSystemInstructions(): string;

  /**
   * Filters the set of available tools based on the mode's operational constraints.
   *
   * @param tools - Full array of tools enabled for the agent.
   * @returns Allowed subset of tools for this mode.
   */
  filterTools(tools: readonly ITool[]): ITool[];

  /**
   * Determines whether the agent should terminate the loop after an assistant response.
   *
   * @param hasToolCalls - Whether the model generated tool calls in its latest turn.
   * @returns True if the loop should conclude.
   */
  shouldTerminate(hasToolCalls: boolean): boolean;
}
