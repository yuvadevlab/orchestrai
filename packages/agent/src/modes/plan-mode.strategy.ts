/**
 * @file packages/agent/src/modes/plan-mode.strategy.ts
 * @description Strategy implementation for analytical PLAN mode.
 */

import { AgentMode, ToolPermissionLevel } from "@orchestrai/shared-types";
import { PLAN_MODE_SYSTEM_PROMPT } from "@orchestrai/prompts";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing analytical PLAN mode.
 * Enforces structured task decomposition before any irreversible actions are taken.
 */
export class PlanModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.PLAN;

  /**
   * Returns canonical system guidance for PLAN mode from @orchestrai/prompts.
   */
  public getSystemInstructions(): string {
    return PLAN_MODE_SYSTEM_PROMPT;
  }

  /**
   * Only allows READ_ONLY tools (for codebase or system reconnaissance) in PLAN mode.
   */
  public filterTools(tools: readonly ITool[]): ITool[] {
    return tools.filter((t) => t.definition.permissionLevel === ToolPermissionLevel.READ_ONLY);
  }

  /**
   * Terminates once the model outputs its plan without dispatching further tools.
   */
  public shouldTerminate(hasToolCalls: boolean): boolean {
    return !hasToolCalls;
  }
}
