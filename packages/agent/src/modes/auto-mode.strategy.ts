/**
 * @file packages/agent/src/modes/auto-mode.strategy.ts
 * @description Strategy implementation for adaptive AUTO mode.
 */

import { AgentMode } from "@orchestrai/shared-types";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing adaptive AUTO mode.
 * Dynamically balances analysis, planning, and execution based on task complexity.
 */
export class AutoModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.AUTO;

  /**
   * System guidance for AUTO mode.
   */
  public getSystemInstructions(): string {
    return (
      "Operating Mode: AUTO.\n" +
      "You are an adaptive orchestrator. Assess task complexity dynamically. " +
      "For complex multi-step workflows, briefly state your intended approach, " +
      "then execute tools methodically, verify results, and conclude with a concise summary."
    );
  }

  /**
   * Full tool clearance in AUTO mode.
   */
  public filterTools(tools: readonly ITool[]): ITool[] {
    return [...tools];
  }

  /**
   * Concludes execution once no more tool calls are emitted.
   */
  public shouldTerminate(hasToolCalls: boolean): boolean {
    return !hasToolCalls;
  }
}
