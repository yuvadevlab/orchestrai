/**
 * @file packages/models/src/adapters/ollama/ollama.config.schema.ts
 * @description Zod validation schema for OllamaAdapter construction config.
 *
 * Learning note — Zod at adapter boundaries:
 * Every adapter receives raw config (from env vars, JSON files, or user code).
 * We parse it with Zod before using any field. This converts runtime unknowns
 * into type-safe values with clear validation errors, rather than cryptic
 * "cannot read property of undefined" crashes deep inside the adapter.
 */

import { z } from "zod";

/**
 * Configuration schema for connecting to a local Ollama server.
 *
 * Ollama runs as a local HTTP daemon (default port 11434).
 * The adapter uses this to construct the Ollama client instance.
 *
 * @example
 * const config = OllamaConfigSchema.parse({
 *   host: "http://localhost:11434",
 *   defaultModel: "qwen2.5:7b",
 * });
 */
export const OllamaConfigSchema = z
  .object({
    /**
     * Base URL of the Ollama HTTP server.
     * Override this if you run Ollama on a remote host or custom port.
     */
    host: z.string().url().default("http://localhost:11434").describe("Ollama server base URL"),

    /**
     * Optional fallback model to use when LlmRequest.model is not specified.
     */
    defaultModel: z
      .string()
      .min(1)
      .optional()
      .describe("Fallback model when request omits model field"),

    /**
     * Request timeout in milliseconds.
     * Ollama can be slow on first inference (model loading).
     * 120 seconds gives enough headroom for cold starts.
     */
    timeoutMs: z
      .number()
      .int()
      .positive()
      .default(120_000)
      .describe("Request timeout in milliseconds"),
  })
  .describe("Configuration for the Ollama LLM adapter");

/** Inferred TypeScript type for OllamaConfig */
export type OllamaConfig = z.infer<typeof OllamaConfigSchema>;
