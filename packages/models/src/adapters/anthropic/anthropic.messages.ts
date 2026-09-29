/**
 * @file packages/models/src/adapters/anthropic/anthropic.messages.ts
 * @description Message formatting and structural types for the Anthropic Claude API.
 * @module packages/models/adapters/anthropic
 */

import { MessageRole, type AIMessage } from "@orchestrai/core";

/** Minimal structural type for the @anthropic-ai/sdk client */
export interface AnthropicClientLike {
  messages: {
    create(params: {
      model: string;
      max_tokens: number;
      system?: string;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      temperature?: number;
      stream?: boolean;
    }): Promise<AnthropicMessage | AsyncIterable<AnthropicStreamEvent>>;
  };
}

export interface AnthropicMessage {
  content: Array<{ type: string; text?: string }>;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
}

export interface AnthropicStreamEvent {
  type: string;
  delta?: { type: string; text?: string };
  message?: { usage?: { input_tokens: number; output_tokens: number } };
}

/**
 * Splits OrchestrAI ChatMessage[] into Anthropic's expected format:
 *   - `system`: concatenated text from all system-role messages
 *   - `messages`: only user + assistant turns, as flat `{ role, content }` objects
 *
 * @param messages - Full OrchestrAI message history
 * @returns Split system string and filtered message array
 */
export function toAnthropicMessages(messages: AIMessage[]): {
  system: string | undefined;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const systemParts: string[] = [];
  const conversationMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const msg of messages) {
    // Handle the AIMessage.content union: string or ContentBlock[]
    const textContent =
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            .filter((b): b is { type: "text"; text: string } => b.type === "text")
            .map((b) => b.text)
            .join("");

    if (msg.role === MessageRole.SYSTEM) {
      // Collect system messages separately — Anthropic hoists them to top-level
      systemParts.push(textContent);
    } else if (msg.role === MessageRole.USER || msg.role === MessageRole.ASSISTANT) {
      // Only user/assistant roles are valid in Anthropic's messages[]
      conversationMessages.push({ role: msg.role as "user" | "assistant", content: textContent });
    }
  }

  return {
    system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    messages: conversationMessages,
  };
}
