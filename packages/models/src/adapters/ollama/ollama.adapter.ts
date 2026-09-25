/**
 * @file packages/models/src/adapters/ollama/ollama.adapter.ts
 * @description ILlmAdapter implementation for local Ollama LLM server.
 *
 * ─── How Ollama works (Learning note) ───────────────────────────────────────
 * Ollama is a local server that:
 * 1. Downloads and manages open-source model weights (Llama, Mistral, Qwen…)
 * 2. Exposes a REST API at localhost:11434
 * 3. The `ollama` npm package is a thin TypeScript client over that REST API
 *
 * When you call `invoke()`, this adapter:
 *   a. Converts OrchestrAI's ChatMessage[] into Ollama's MessageParam[]
 *   b. Calls the Ollama client's `.chat()` method
 *   c. Maps the response back to our standard LlmResponse shape
 *
 * When you call `stream()`, it uses an `async function*` (async generator)
 * — each `yield` emits one chunk to the caller's `for await` loop.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ModelProvider, OrchestrAIError } from "@orchestrai/core";
import type { ILlmAdapter, LlmRequest, LlmResponse, LlmStreamChunk } from "@/interfaces";
import type { OllamaConfig } from "./ollama.config.schema";
import { toOllamaMessages, type OllamaWireMessage } from "./ollama.mapper";

// ─── Ollama SDK type shim ────────────────────────────────────────────────────
// We use a minimal structural type instead of importing from `ollama` directly.
// This keeps the package compilable even when the `ollama` npm package isn't
// installed — the actual import happens dynamically in the static create() method.

/** Minimal shape of the Ollama npm client we rely on */
interface OllamaClientLike {
  chat(params: {
    model: string;
    messages: OllamaWireMessage[];
    stream?: boolean;
    options?: { temperature?: number; num_predict?: number };
  }): Promise<OllamaChatResponse | AsyncIterable<OllamaChatChunk>>;
}

interface OllamaChatResponse {
  message: { content: string };
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaChatChunk {
  message: { content: string };
  done: boolean;
}

// ─── Adapter Implementation ───────────────────────────────────────────────────

/**
 * OrchestrAI LLM adapter for local Ollama models.
 *
 * Implements the ILlmAdapter interface to provide both blocking (`invoke`)
 * and streaming (`stream`) access to any model pulled in your local Ollama instance.
 *
 * @example
 * const adapter = await OllamaAdapter.create({ host: "http://localhost:11434" });
 * const response = await adapter.invoke({ model: "qwen2.5:7b", messages, stream: false });
 */
export class OllamaAdapter implements ILlmAdapter {
  /** Provider identifier — always OLLAMA for this adapter */
  public readonly provider = ModelProvider.OLLAMA;

  /**
   * The Ollama client instance — held as `unknown` until the dynamic import
   * succeeds so TypeScript doesn't require the `ollama` package at compile time.
   */
  private readonly client: OllamaClientLike;

  private readonly config: OllamaConfig;

  /**
   * Private constructor — use the static `create()` factory method instead.
   * Direct construction is prevented to enforce async initialization (dynamic import).
   */
  private constructor(client: OllamaClientLike, config: OllamaConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * Async factory that dynamically imports the `ollama` npm package and
   * constructs a configured OllamaAdapter instance.
   *
   * Why static async factory instead of constructor?
   * JavaScript constructors are synchronous — they can't `await`. Because we
   * need to `await import("ollama")` to detect whether the peer dep is installed,
   * we use a static async factory pattern. This is idiomatic for async init.
   *
   * @param config - Validated OllamaConfig (use OllamaConfigSchema.parse first)
   * @returns Promise resolving to a ready OllamaAdapter instance
   * @throws {OrchestrAIError} with code VALIDATION_ERROR if `ollama` npm package is not installed
   */
  static async create(config: OllamaConfig): Promise<OllamaAdapter> {
    let OllamaClient: new (opts: { host: string }) => OllamaClientLike;

    try {
      // Dynamic import — only resolved at runtime, not compile time.
      // If the `ollama` package isn't installed, this throws and we surface
      // a helpful error rather than a cryptic MODULE_NOT_FOUND crash.
      const mod = await import("ollama");
      OllamaClient = mod.Ollama as typeof OllamaClient;
    } catch {
      // Peer dependency not installed — guide the user toward the fix
      throw new OrchestrAIError(
        "The `ollama` npm package is required to use OllamaAdapter. " +
          "Install it: pnpm add ollama",
        "VALIDATION_ERROR",
        500,
        { peerDep: "ollama" },
      );
    }

    const client = new OllamaClient({ host: config.host });
    return new OllamaAdapter(client, config);
  }

  /**
   * Invokes the Ollama model and waits for the full response.
   *
   * @param request - LlmRequest with model name, messages, and sampling params
   * @returns Resolved LlmResponse with generated content and token usage
   * @throws {OrchestrAIError} with code MODEL_TIMEOUT if the Ollama server is unreachable
   */
  async invoke(request: LlmRequest): Promise<LlmResponse> {
    const model = request.model ?? this.config.defaultModel;
    if (!model) {
      throw new OrchestrAIError(
        "No model identifier specified for Ollama invocation",
        "VALIDATION_ERROR",
        400,
      );
    }

    try {
      const raw = (await this.client.chat({
        model,
        messages: toOllamaMessages(request.messages),
        stream: false,
        options: {
          temperature: request.temperature,
          // Ollama uses `num_predict` for max output tokens
          ...(request.maxTokens !== undefined && { num_predict: request.maxTokens }),
        },
      })) as OllamaChatResponse;

      return {
        content: raw.message.content,
        usage: {
          promptTokens: raw.prompt_eval_count ?? 0,
          completionTokens: raw.eval_count ?? 0,
          totalTokens: (raw.prompt_eval_count ?? 0) + (raw.eval_count ?? 0),
          estimatedCostUsd: 0, // Ollama is local — zero API cost
        },
        finishReason: raw.done ? "stop" : "length",
      };
    } catch (err) {
      // Re-wrap unexpected errors in our structured error type so callers
      // don't need to handle Ollama-specific error shapes
      if (err instanceof OrchestrAIError) throw err;
      throw new OrchestrAIError(
        `Ollama invoke failed for model "${model}": ${String(err)}`,
        "MODEL_TIMEOUT",
        503,
        { model, cause: err },
      );
    }
  }

  /**
   * Streams the Ollama model response as an async generator of token chunks.
   *
   * Learning note — `async function*` (Async Generator):
   * An async generator is a function that can `yield` multiple values over time,
   * and each yield can be awaited. The caller consumes it with `for await (const chunk of ...)`.
   * Generators are lazy — they only produce the next chunk when the caller asks for it,
   * which naturally provides backpressure (the client controls consumption speed).
   *
   * @param request - LlmRequest payload (stream flag is ignored; always streams here)
   * @yields LlmStreamChunk deltas including the terminal done=true chunk
   * @throws {OrchestrAIError} with code MODEL_TIMEOUT on network failure
   */
  async *stream(request: LlmRequest): AsyncIterable<LlmStreamChunk> {
    const model = request.model ?? this.config.defaultModel;
    if (!model) {
      throw new OrchestrAIError(
        "No model identifier specified for Ollama streaming",
        "VALIDATION_ERROR",
        400,
      );
    }

    try {
      const rawStream = (await this.client.chat({
        model,
        messages: toOllamaMessages(request.messages),
        stream: true,
        options: { temperature: request.temperature },
      })) as AsyncIterable<OllamaChatChunk>;

      for await (const chunk of rawStream) {
        yield {
          delta: chunk.message.content,
          done: chunk.done,
          // Usage is only available on the final chunk from Ollama
          usage: undefined,
        };
      }
    } catch (err) {
      if (err instanceof OrchestrAIError) throw err;
      throw new OrchestrAIError(
        `Ollama stream failed for model "${model}": ${String(err)}`,
        "MODEL_TIMEOUT",
        503,
        { model, cause: err },
      );
    }
  }
}
