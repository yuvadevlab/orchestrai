/**
 * @file packages/memory/src/conversation/conversation-window.ts
 * @description Sliding window and token-aware buffer for short-term conversational context.
 */

import type { AIMessage } from "@orchestrai/core";

/**
 * Options configuring the ConversationWindow buffer.
 */
export interface ConversationWindowConfig {
  /** Maximum number of raw dialogue turns to retain before trimming (default: 10) */
  readonly maxTurns?: number;
  /** Maximum estimated token budget for the conversation buffer (default: 4000) */
  readonly maxTokens?: number;
}

/**
 * Manages short-term dialogue context, sliding window truncation, and token budgeting.
 */
export class ConversationWindow {
  private readonly maxTurns: number;
  private readonly maxTokens: number;
  private messages: AIMessage[] = [];

  constructor(config?: ConversationWindowConfig) {
    this.maxTurns = config?.maxTurns ?? 10;
    this.maxTokens = config?.maxTokens ?? 4000;
  }

  /**
   * Appends one or more messages to the active conversation context.
   */
  public addMessages(messages: readonly AIMessage[]): void {
    this.messages.push(...messages);
    this.applyWindowConstraints();
  }

  /**
   * Retrieves the current constrained message window.
   */
  public getMessages(): readonly AIMessage[] {
    return [...this.messages];
  }

  /**
   * Clears the active conversation window.
   */
  public clear(): void {
    this.messages = [];
  }

  /**
   * Calculates a rough token count estimate (average 4 chars per token).
   */
  public estimateTokens(): number {
    return this.messages.reduce((acc, msg) => {
      const len = typeof msg.content === "string" ? msg.content.length : 100;
      return acc + Math.ceil(len / 4);
    }, 0);
  }

  /**
   * Trims older messages when turn limit or token ceiling is exceeded.
   */
  private applyWindowConstraints(): void {
    // 1. Truncate by turn count
    if (this.messages.length > this.maxTurns) {
      this.messages = this.messages.slice(-this.maxTurns);
    }

    // 2. Truncate by token budget
    while (this.messages.length > 2 && this.estimateTokens() > this.maxTokens) {
      this.messages.shift();
    }
  }
}
