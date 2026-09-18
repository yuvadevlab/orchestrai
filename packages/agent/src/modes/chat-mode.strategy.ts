/**
 * @file packages/agent/src/modes/chat-mode.strategy.ts
 * @description Strategy implementation for conversational CHAT mode.
 */

import { AgentMode, ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing conversational CHAT mode.
 * Prioritizes direct dialogue and restricts tools to safe, non-destructive queries.
 */
export class ChatModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.CHAT;

  /**
   * System guidance for CHAT mode.
   */
  public getSystemInstructions(): string {
    return (
      "Operating Mode: CHAT.\n" +
      "Focus on direct, helpful, conversational responses. " +
      "Only invoke tools if the user explicitly requests an action, search, or data inspection."
    );
  }

  /**
   * Restricts tools to READ_ONLY for conversational safety.
   */
  public filterTools(tools: readonly ITool[]): ITool[] {
    // In pure chat mode, block destructive/dangerous tools unless overridden
    return tools.filter(
      (t) =>
        t.definition.permissionLevel === ToolPermissionLevel.READ_ONLY ||
        t.definition.permissionLevel === ToolPermissionLevel.WRITE_SAFE,
    );
  }

  /**
   * CHAT mode terminates immediately whenever the model outputs text without tool calls.
   */
  public shouldTerminate(hasToolCalls: boolean): boolean {
    return !hasToolCalls;
  }
}
