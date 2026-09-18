/**
 * @file packages/models/src/adapters/openai/openai.adapter.ts
 * @description ILlmAdapter implementation for the OpenAI API (and compatible endpoints).
 *
 * ─── OpenAI API crash course (Learning note) ─────────────────────────────────
 * OpenAI's Chat Completions endpoint accepts:
 *   POST /v1/chat/completions
 *   { model, messages: [{role, content}], temperature, max_tokens, stream }
 *
 * When stream=false: responds with one JSON body → { choices: [{ message }] }
 * When stream=true:  responds with SSE (Server-Sent Events) lines → `data: {...}`
 *
 * The `openai` SDK abstracts both modes. In streaming mode, it returns an
 * async iterable of "chunks" — each chunk has `choices[0].delta.content`.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ModelProvider, OrchestrAIError } from "@orchestrai/core";
import type { AIMessage } from "@orchestrai/core";
import type { ILlmAdapter, LlmRequest, LlmResponse, LlmStreamChunk } from "@/interfaces";
import type { OpenAiConfig } from "./openai.config.schema";

/** Minimal structural type for the OpenAI client we depend on */
interface OpenAiClientLike {
  chat: {
    completions: {
      create(params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }): Promise<OpenAiCompletion | AsyncIterable<OpenAiChunk>>;
    };
  };
}

interface OpenAiCompletion {
  choices: Array<{
    message: { content: string | null };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

interface OpenAiChunk {
  choices: Array<{ delta: { content?: string }; finish_reason: string | null }>;
}

/**
 * Converts OrchestrAI ChatMessage[] to OpenAI-compatible message format.
 * Extracts text blocks and collapses them into a single content string.
 *
 * @param messages - OrchestrAI ChatMessage array
 * @returns Flat message array for the OpenAI client
 */
function toOpenAiMessages(messages: AIMessage[]): Array<{ role: string; content: string }> {
  return messages.map((msg) => ({
    role: msg.role,
    content:
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            .filter((b): b is { type: "text"; text: string } => b.type === "text")
            .map((b) => b.text)
            .join(""),
  }));
}

/**
 * OrchestrAI LLM adapter for the OpenAI Chat Completions API.
 * Also compatible with any OpenAI-format server (Azure, LM Studio, Together AI).
 *
 * @example
 * const adapter = await OpenAiAdapter.create(
 *   OpenAiConfigSchema.parse({ apiKey: process.env.OPENAI_API_KEY })
 * );
 * const res = await adapter.invoke({ model: "gpt-4o-mini", messages, stream: false });
 */
export class OpenAiAdapter implements ILlmAdapter {
  public readonly provider = ModelProvider.OPENAI;
  private readonly client: OpenAiClientLike;

  private constructor(client: OpenAiClientLike) {
    this.client = client;
  }

  /**
   * Async factory that dynamically imports the `openai` npm package.
   *
   * @param config - Validated OpenAiConfig
   * @returns Promise resolving to a ready OpenAiAdapter
   * @throws {OrchestrAIError} VALIDATION_ERROR if `openai` is not installed
   */
  static async create(config: OpenAiConfig): Promise<OpenAiAdapter> {
    let OpenAI: new (opts: {
      apiKey: string;
      baseURL?: string;
      organization?: string;
      maxRetries?: number;
    }) => OpenAiClientLike;

    try {
      const mod = await import("openai");
      OpenAI = mod.OpenAI as typeof OpenAI;
    } catch {
      throw new OrchestrAIError(
        "The `openai` npm package is required to use OpenAiAdapter. Install it: pnpm add openai",
        "VALIDATION_ERROR",
        500,
        { peerDep: "openai" },
      );
    }

    const client = new OpenAI({
      apiKey: config.apiKey,
      ...(config.baseUrl !== undefined && { baseURL: config.baseUrl }),
      ...(config.organization !== undefined && { organization: config.organization }),
      maxRetries: config.maxRetries,
    });

    return new OpenAiAdapter(client);
  }

  /**
   * Invokes the OpenAI model with a blocking request.
   *
   * @param request - LlmRequest payload
   * @returns Complete LlmResponse with content and usage metrics
   * @throws {OrchestrAIError} MODEL_TIMEOUT on API failure
   */
  async invoke(request: LlmRequest): Promise<LlmResponse> {
    try {
      const raw = (await this.client.chat.completions.create({
        model: request.model,
        messages: toOpenAiMessages(request.messages),
        temperature: request.temperature,
        ...(request.maxTokens !== undefined && { max_tokens: request.maxTokens }),
        stream: false,
      })) as OpenAiCompletion;

      const choice = raw.choices[0];
      // Guard: OpenAI always returns at least one choice, but defensive check
      if (choice === undefined) {
        throw new OrchestrAIError("OpenAI returned empty choices array", "MODEL_TIMEOUT", 502);
      }

      return {
        content: choice.message.content ?? "",
        usage: raw.usage
          ? {
              promptTokens: raw.usage.prompt_tokens,
              completionTokens: raw.usage.completion_tokens,
              totalTokens: raw.usage.total_tokens,
              estimatedCostUsd: 0, // Populated by usage-aggregator with pricing constants
            }
          : undefined,
        finishReason: choice.finish_reason ?? undefined,
      };
    } catch (err) {
      if (err instanceof OrchestrAIError) throw err;
      throw new OrchestrAIError(
        `OpenAI invoke failed for model "${request.model}": ${String(err)}`,
        "MODEL_TIMEOUT",
        503,
        { model: request.model, cause: err },
      );
    }
  }

  /**
   * Streams the OpenAI response as an async generator.
   * Each chunk yields the `delta.content` text fragment.
   *
   * @param request - LlmRequest payload
   * @yields LlmStreamChunk with incremental text delta
   * @throws {OrchestrAIError} MODEL_TIMEOUT on network failure
   */
  async *stream(request: LlmRequest): AsyncIterable<LlmStreamChunk> {
    try {
      const rawStream = (await this.client.chat.completions.create({
        model: request.model,
        messages: toOpenAiMessages(request.messages),
        temperature: request.temperature,
        stream: true,
      })) as AsyncIterable<OpenAiChunk>;

      for await (const chunk of rawStream) {
        const choice = chunk.choices[0];
        // Skip chunks where the model hasn't emitted any text yet (e.g. first chunk)
        if (choice === undefined) continue;

        const isDone = choice.finish_reason !== null;
        yield {
          delta: choice.delta.content ?? "",
          done: isDone,
        };
      }
    } catch (err) {
      if (err instanceof OrchestrAIError) throw err;
      throw new OrchestrAIError(
        `OpenAI stream failed for model "${request.model}": ${String(err)}`,
        "MODEL_TIMEOUT",
        503,
        { model: request.model, cause: err },
      );
    }
  }
}
