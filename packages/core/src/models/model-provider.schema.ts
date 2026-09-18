/**
 * @file packages/core/src/models/model-provider.schema.ts
 * @description Provider designations and model identifier contracts.
 */

import { z } from "zod";
import { ModelProvider } from "@orchestrai/shared-types";

/**
 * Recognized LLM runtime provider engines backed by ModelProvider enum.
 */
export const ModelProviderSchema = z
  .nativeEnum(ModelProvider)
  .describe("Underlying AI model provider backend");

/**
 * Detailed specification of a model endpoint.
 */
export const ModelIdentifierSchema = z
  .object({
    provider: ModelProviderSchema,
    modelName: z.string().min(1).describe("Provider-specific model name (e.g. qwen2.5:7b, gpt-4o)"),
    displayName: z
      .string()
      .optional()
      .describe("User-facing label displayed in the operator console"),
    contextWindow: z
      .number()
      .int()
      .positive()
      .default(8192)
      .describe("Maximum context token window size"),
    apiEndpoint: z.string().url().optional().describe("Optional custom host or proxy URL"),
  })
  .describe("Identifier and context specifications for an AI model");

export type ModelIdentifier = z.infer<typeof ModelIdentifierSchema>;
