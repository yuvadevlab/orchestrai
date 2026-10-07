/**
 * @file packages/agent/src/modes/auto-mode.strategy.ts
 * @description Strategy implementation for adaptive AUTO mode.
 */

import { AgentMode } from "@orchestrai/shared-types";
import { AUTO_MODE_SYSTEM_PROMPT } from "@orchestrai/prompts";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing adaptive AUTO mode.
 * Dynamically balances analysis, planning, and execution based on task complexity.
 */
export class AutoModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.AUTO;

  /**
   * Returns canonical system guidance for AUTO mode from @orchestrai/prompts.
   */
  public getSystemInstructions(): string {
    return AUTO_MODE_SYSTEM_PROMPT;
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
