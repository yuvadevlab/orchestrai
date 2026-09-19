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
   * Enforces no side effects by strictly permitting only READ_ONLY tools.
   */
  public filterTools(tools: readonly ITool[]): ITool[] {
    // In CHAT mode, enforce zero side-effects: block all mutation/write tools
    return tools.filter((t) => t.definition.permissionLevel === ToolPermissionLevel.READ_ONLY);
  }

  /**
   * CHAT mode terminates immediately whenever the model outputs text without tool calls.
   */
  public shouldTerminate(hasToolCalls: boolean): boolean {
    return !hasToolCalls;
  }
}
