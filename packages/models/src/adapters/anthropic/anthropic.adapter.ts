/**
 * @file packages/models/src/adapters/anthropic/anthropic.adapter.ts
 * @description ILlmAdapter implementation for the Anthropic Claude API.
 *
 * ─── Anthropic vs OpenAI format (Learning note) ──────────────────────────────
 * Anthropic's API differs from OpenAI in one key structural way:
 *   • OpenAI:    system prompt lives inside the messages[] array as role="system"
 *   • Anthropic: system prompt is a TOP-LEVEL `system` field, NOT in messages[]
 *
 * The Anthropic API also only accepts "user" and "assistant" roles in messages[].
 * So our adapter must split the OrchestrAI message list: extract the system
 * message(s) separately, and forward only user/assistant turns to the `messages`
 * field. This is a classic "impedance mismatch" problem between different APIs
 * that the adapter pattern is purpose-built to solve.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ModelProvider, OrchestrAIError } from "@orchestrai/core";
import type { AIMessage } from "@orchestrai/core";
import type { ILlmAdapter, LlmRequest, LlmResponse, LlmStreamChunk } from "@/interfaces";
import type { AnthropicConfig } from "./anthropic.config.schema";

/** Minimal structural type for the @anthropic-ai/sdk client */
interface AnthropicClientLike {
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

interface AnthropicMessage {
  content: Array<{ type: string; text?: string }>;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
}

interface AnthropicStreamEvent {
  type: string;
  delta?: { type: string; text?: string };
  message?: { usage?: { input_tokens: number; output_tokens: number } };
}

// ─── Message conversion helper ────────────────────────────────────────────────

/**
 * Splits OrchestrAI ChatMessage[] into Anthropic's expected format:
 *   - `system`: concatenated text from all system-role messages
 *   - `messages`: only user + assistant turns, as flat `{ role, content }` objects
 *
 * Why concatenate multiple system messages?
 * OrchestrAI's internal pipeline may prepend multiple system context blocks
 * (agent persona, tool descriptions, safety instructions). Anthropic accepts
 * only ONE system string, so we join them with double newlines.
 *
 * @param messages - Full OrchestrAI message history
 * @returns Split system string and filtered message array
 */
function toAnthropicMessages(messages: AIMessage[]): {
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

    if (msg.role === "system") {
      // Collect system messages separately — Anthropic hoists them to top-level
      systemParts.push(textContent);
    } else if (msg.role === "user" || msg.role === "assistant") {
      // Only user/assistant roles are valid in Anthropic's messages[]
      conversationMessages.push({ role: msg.role, content: textContent });
    }
    // Tool role messages are omitted here — handled at a higher abstraction layer
  }

  return {
    // Return undefined if no system messages, so the field is omitted entirely
    system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    messages: conversationMessages,
  };
}

// ─── Adapter Implementation ───────────────────────────────────────────────────

/**
 * OrchestrAI LLM adapter for Anthropic's Claude models.
 *
 * @example
 * const adapter = await AnthropicAdapter.create(
 *   AnthropicConfigSchema.parse({ apiKey: process.env.ANTHROPIC_API_KEY })
 * );
 * const res = await adapter.invoke({ model: "claude-3-5-sonnet-20241022", messages });
 */
export class AnthropicAdapter implements ILlmAdapter {
  public readonly provider = ModelProvider.ANTHROPIC;
  private readonly client: AnthropicClientLike;
  private readonly config: AnthropicConfig;

  private constructor(client: AnthropicClientLike, config: AnthropicConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * Async factory that dynamically imports `@anthropic-ai/sdk`.
   *
   * @param config - Validated AnthropicConfig
   * @returns Promise resolving to a ready AnthropicAdapter
   * @throws {OrchestrAIError} VALIDATION_ERROR if the SDK peer dep is missing
   */
  static async create(config: AnthropicConfig): Promise<AnthropicAdapter> {
    let Anthropic: new (opts: {
      apiKey: string;
      maxRetries?: number;
      defaultHeaders?: Record<string, string>;
    }) => AnthropicClientLike;

    try {
      const mod = await import("@anthropic-ai/sdk");
      Anthropic = mod.Anthropic as typeof Anthropic;
    } catch {
      throw new OrchestrAIError(
        "The `@anthropic-ai/sdk` package is required to use AnthropicAdapter. " +
          "Install it: pnpm add @anthropic-ai/sdk",
        "VALIDATION_ERROR",
        500,
        { peerDep: "@anthropic-ai/sdk" },
      );
    }

    const client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries,
      // Pass the API version as a default header per Anthropic's requirements
      defaultHeaders: { "anthropic-version": config.apiVersion },
    });

    return new AnthropicAdapter(client, config);
  }

  /**
   * Invokes the Claude model and waits for the complete response.
   *
   * @param request - LlmRequest payload
   * @returns Complete LlmResponse
   * @throws {OrchestrAIError} MODEL_TIMEOUT on API failure
   */
  async invoke(request: LlmRequest): Promise<LlmResponse> {
    const model = request.model ?? this.config.defaultModel;
    if (!model) {
      throw new OrchestrAIError(
        "No model identifier specified for Anthropic request",
        "VALIDATION_ERROR",
        400,
      );
    }
    const { system, messages } = toAnthropicMessages(request.messages);

    try {
      const raw = (await this.client.messages.create({
        model,
        // Anthropic requires max_tokens to always be specified — no default in the API
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        ...(system !== undefined && { system }),
        messages,
        stream: false,
      })) as AnthropicMessage;

      // Extract text from content blocks (Claude may return multiple blocks)
      const content = raw.content
        .filter((b) => b.type === "text" && b.text !== undefined)
        .map((b) => b.text ?? "")
        .join("");

      return {
        content,
        usage: {
          promptTokens: raw.usage.input_tokens,
          completionTokens: raw.usage.output_tokens,
          totalTokens: raw.usage.input_tokens + raw.usage.output_tokens,
          estimatedCostUsd: 0,
        },
        finishReason: raw.stop_reason ?? undefined,
      };
    } catch (err) {
      if (err instanceof OrchestrAIError) throw err;
      throw new OrchestrAIError(
        `Anthropic invoke failed for model "${model}": ${String(err)}`,
        "MODEL_TIMEOUT",
        503,
        { model, cause: err },
      );
    }
  }

  /**
   * Streams the Claude response as an async generator of token delta chunks.
   * Anthropic's streaming uses Server-Sent Events (SSE) with typed event objects.
   *
   * @param request - LlmRequest payload
   * @yields LlmStreamChunk with incremental text delta
   */
  async *stream(request: LlmRequest): AsyncIterable<LlmStreamChunk> {
    const model = request.model ?? this.config.defaultModel;
    if (!model) {
      throw new OrchestrAIError(
        "No model identifier specified for Anthropic stream",
        "VALIDATION_ERROR",
        400,
      );
    }
    const { system, messages } = toAnthropicMessages(request.messages);

    try {
      const rawStream = (await this.client.messages.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        ...(system !== undefined && { system }),
        messages,
        stream: true,
      })) as AsyncIterable<AnthropicStreamEvent>;

      for await (const event of rawStream) {
        // Only yield content delta events — skip start/stop metadata events
        if (event.type === "content_block_delta" && event.delta?.text !== undefined) {
          yield { delta: event.delta.text, done: false };
        }

        // The message_stop event signals stream completion
        if (event.type === "message_stop") {
          yield { delta: "", done: true };
        }
      }
    } catch (err) {
      if (err instanceof OrchestrAIError) throw err;
      throw new OrchestrAIError(
        `Anthropic stream failed for model "${request.model}": ${String(err)}`,
        "MODEL_TIMEOUT",
        503,
        { model: request.model, cause: err },
      );
    }
  }
}
