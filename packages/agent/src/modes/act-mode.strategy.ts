/**
 * @file packages/agent/src/modes/act-mode.strategy.ts
 * @description Strategy implementation for autonomous action-focused ACT mode.
 */

import { AgentMode } from "@orchestrai/shared-types";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing autonomous ACT mode.
 * Prioritizes direct tool execution with minimal conversational overhead.
 */
export class ActModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.ACT;

  /**
   * System guidance for ACT mode.
   */
  public getSystemInstructions(): string {
    return (
      "Operating Mode: ACT.\n" +
      "You are an autonomous action engine. Prioritize direct tool execution over conversational explanation. " +
      "Perform the necessary operations sequentially and conclude when the goal is achieved."
    );
  }

  /**
   * All authorized tools are accessible in ACT mode.
   */
  public filterTools(tools: readonly ITool[]): ITool[] {
    return [...tools];
  }

  /**
   * Terminates when the agent has completed all tool calls and returns final text.
   */
  public shouldTerminate(hasToolCalls: boolean): boolean {
    return !hasToolCalls;
  }
}
