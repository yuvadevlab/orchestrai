/**
 * @file packages/agent/src/modes/plan-mode.strategy.ts
 * @description Strategy implementation for analytical PLAN mode.
 */

import { AgentMode, ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing analytical PLAN mode.
 * Enforces structured task decomposition before any irreversible actions are taken.
 */
export class PlanModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.PLAN;

  /**
   * System guidance for PLAN mode.
   */
  public getSystemInstructions(): string {
    return (
      "Operating Mode: PLAN.\n" +
      "Analyze the user's objective and deconstruct it into a logical, numbered plan of execution. " +
      "Use read-only exploration tools to investigate context if necessary, but do NOT execute " +
      "destructive modifications yet. Focus on architecture, verification criteria, and clear steps."
    );
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
