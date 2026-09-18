/**
 * @file packages/models/src/adapters/anthropic/anthropic.config.schema.ts
 * @description Zod validation schema for AnthropicAdapter construction config.
 */

import { z } from "zod";

/**
 * Configuration schema for the Anthropic Claude adapter.
 *
 * @example
 * const config = AnthropicConfigSchema.parse({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 * });
 */
export const AnthropicConfigSchema = z
  .object({
    /**
     * Anthropic API secret key, obtained from console.anthropic.com.
     * Required for all Claude API calls.
     */
    apiKey: z.string().min(1).describe("Anthropic API secret key"),

    /**
     * Anthropic API version header. Defaults to the stable production version.
     * Only override this if you need access to a specific beta or preview API.
     */
    apiVersion: z.string().default("2023-06-01").describe("Anthropic API version header"),

    /**
     * Maximum automatic retries on transient 429 / 5xx errors.
     * The @anthropic-ai/sdk handles exponential backoff for these retries.
     */
    maxRetries: z.number().int().min(0).max(5).default(2).describe("Max SDK-level retry attempts"),
  })
  .describe("Configuration for the Anthropic Claude adapter");

/** Inferred TypeScript type for AnthropicConfig */
export type AnthropicConfig = z.infer<typeof AnthropicConfigSchema>;
