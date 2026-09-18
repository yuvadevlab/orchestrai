/**
 * @file packages/core/src/models/model-capabilities.schema.ts
 * @description Capability flags describing what a specific model supports.
 */

import { z } from "zod";

/**
 * Feature capabilities matrix for model routing and prompt compilation.
 */
export const ModelCapabilitiesSchema = z
  .object({
    supportsStreaming: z
      .boolean()
      .default(true)
      .describe("Whether the model supports token streaming"),
    supportsTools: z
      .boolean()
      .default(true)
      .describe("Whether the model supports native function/tool calling"),
    supportsVision: z
      .boolean()
      .default(false)
      .describe("Whether the model accepts image input blocks"),
    supportsThinking: z
      .boolean()
      .default(false)
      .describe("Whether the model produces structured chain-of-thought"),
    supportsJsonMode: z
      .boolean()
      .default(true)
      .describe("Whether the model can guarantee valid JSON responses"),
    maxOutputTokens: z
      .number()
      .int()
      .positive()
      .default(4096)
      .describe("Maximum generated token limit"),
  })
  .describe("Feature capability matrix for an AI model");

export type ModelCapabilities = z.infer<typeof ModelCapabilitiesSchema>;
