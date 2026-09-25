/**
 * @file packages/models/src/adapters/openai/openai.config.schema.ts
 * @description Zod validation schema for OpenAiAdapter construction config.
 */

import { z } from "zod";

/**
 * Configuration schema for the OpenAI adapter.
 *
 * Supports both the official OpenAI API and compatible third-party endpoints
 * (e.g. Azure OpenAI, Together AI, LM Studio) via the `baseUrl` override.
 *
 * @example
 * // Official OpenAI
 * const config = OpenAiConfigSchema.parse({ apiKey: process.env.OPENAI_API_KEY });
 *
 * @example
 * // LM Studio local server (OpenAI-compatible)
 * const config = OpenAiConfigSchema.parse({
 *   apiKey: "lm-studio",
 *   baseUrl: "http://localhost:1234/v1",
 * });
 */
export const OpenAiConfigSchema = z
  .object({
    /**
     * OpenAI API secret key. Required for the official API.
     * For local OpenAI-compatible servers, any non-empty string works.
     */
    apiKey: z.string().min(1).describe("OpenAI API secret key"),

    /**
     * Override the API base URL for compatible third-party providers.
     * Defaults to the official OpenAI endpoint if omitted.
     */
    baseUrl: z
      .string()
      .url()
      .optional()
      .describe("Optional API base URL override for compatible endpoints"),

    /** Optional default model identifier */
    defaultModel: z.string().min(1).optional().describe("Fallback model identifier"),

    /** OpenAI organization ID for billing/audit — optional for personal accounts */
    organization: z.string().optional().describe("OpenAI organization ID"),

    /**
     * Maximum automatic retries on transient failures (429 rate-limit, 5xx server errors).
     * The openai SDK handles exponential backoff automatically.
     */
    maxRetries: z
      .number()
      .int()
      .min(0)
      .max(5)
      .default(2)
      .describe("Max SDK-level retry attempts on transient failures"),
  })
  .describe("Configuration for the OpenAI LLM adapter");

/** Inferred TypeScript type for OpenAiConfig */
export type OpenAiConfig = z.infer<typeof OpenAiConfigSchema>;
