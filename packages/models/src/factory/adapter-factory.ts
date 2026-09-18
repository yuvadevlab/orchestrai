/**
 * @file packages/models/src/factory/adapter-factory.ts
 * @description Unified factory for constructing LLM adapter instances by provider.
 *
 * ─── Why a factory? (Learning note) ──────────────────────────────────────────
 * Rather than making callers import and construct OllamaAdapter / OpenAiAdapter
 * / AnthropicAdapter directly, the factory:
 *   1. Validates the raw config with the correct Zod schema for the provider
 *   2. Calls the async `create()` static factory on the appropriate adapter class
 *   3. Returns the result as the abstract ILlmAdapter interface
 *
 * This means callers never reference concrete adapter classes — they only ever
 * hold an `ILlmAdapter` reference. Swapping providers requires only a config
 * change, not a code change. This is the Open/Closed Principle in practice.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ModelProvider, OrchestrAIError } from "@orchestrai/core";
import { OllamaAdapter, OllamaConfigSchema } from "@/adapters/ollama";
import { OpenAiAdapter, OpenAiConfigSchema } from "@/adapters/openai";
import { AnthropicAdapter, AnthropicConfigSchema } from "@/adapters/anthropic";
import type { ILlmAdapter } from "@/interfaces";

/**
 * Creates and returns a ready-to-use LLM adapter for the specified provider.
 *
 * The factory:
 *  - Validates `config` against the provider-specific Zod schema
 *  - Performs the async initialization (dynamic peer dep import)
 *  - Returns the concrete adapter behind the `ILlmAdapter` interface
 *
 * @param provider - The ModelProvider enum value identifying which adapter to build
 * @param config - Raw (unvalidated) configuration object for the provider.
 *                 Pass `process.env` fields or a config JSON object — Zod will validate.
 * @returns Promise resolving to a configured ILlmAdapter ready for use
 *
 * @throws {OrchestrAIError} VALIDATION_ERROR if `config` fails Zod validation
 * @throws {OrchestrAIError} VALIDATION_ERROR if the required peer SDK is not installed
 *
 * @example
 * // Create an Ollama adapter using local default config
 * const adapter = await createAdapter(ModelProvider.OLLAMA, {
 *   host: "http://localhost:11434",
 *   defaultModel: "qwen2.5:7b",
 * });
 *
 * @example
 * // Create an OpenAI adapter from environment
 * const adapter = await createAdapter(ModelProvider.OPENAI, {
 *   apiKey: process.env.OPENAI_API_KEY,
 * });
 */
export async function createAdapter(
  provider: ModelProvider,
  config: unknown,
): Promise<ILlmAdapter> {
  // The switch below is exhaustive over the ModelProvider enum.
  // TypeScript's noFallthroughCasesInSwitch ensures every case is handled.
  switch (provider) {
    case ModelProvider.OLLAMA: {
      // Parse and validate raw config — throws ZodError with clear messages on invalid input
      const parsed = OllamaConfigSchema.parse(config);
      return OllamaAdapter.create(parsed);
    }

    case ModelProvider.OPENAI: {
      const parsed = OpenAiConfigSchema.parse(config);
      return OpenAiAdapter.create(parsed);
    }

    case ModelProvider.ANTHROPIC: {
      const parsed = AnthropicConfigSchema.parse(config);
      return AnthropicAdapter.create(parsed);
    }

    case ModelProvider.CUSTOM: {
      // CUSTOM provider is reserved for future extensibility (plugin adapters).
      // Throw a clear error now so callers know to implement their own adapter.
      throw new OrchestrAIError(
        "ModelProvider.CUSTOM requires a manually constructed adapter. " +
          "Implement ILlmAdapter directly and register it via ModelRegistry.register().",
        "VALIDATION_ERROR",
        400,
        { provider },
      );
    }

    default: {
      // Exhaustiveness guard — TypeScript will flag this if a new ModelProvider
      // enum value is added without updating this switch. Never should be hit at runtime.
      const _exhaustive: never = provider;
      throw new OrchestrAIError(
        `Unknown ModelProvider: "${String(_exhaustive)}"`,
        "VALIDATION_ERROR",
        400,
        { provider: _exhaustive },
      );
    }
  }
}
