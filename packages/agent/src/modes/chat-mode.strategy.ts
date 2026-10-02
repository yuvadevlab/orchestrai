/**
 * @file packages/agent/src/modes/chat-mode.strategy.ts
 * @description Strategy implementation for conversational CHAT mode.
 */

import { AgentMode, ToolPermissionLevel } from "@orchestrai/shared-types";
import { CHAT_MODE_SYSTEM_PROMPT } from "@orchestrai/prompts";
import type { ITool } from "@orchestrai/tools";
import type { IModeStrategy } from "./mode-strategy.interface";

/**
 * Strategy governing conversational CHAT mode.
 * Prioritizes direct dialogue and restricts tools to safe, non-destructive queries.
 */
export class ChatModeStrategy implements IModeStrategy {
  public readonly mode = AgentMode.CHAT;

  /**
   * Returns canonical system guidance for CHAT mode from @orchestrai/prompts.
   */
  public getSystemInstructions(): string {
    return CHAT_MODE_SYSTEM_PROMPT;
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
