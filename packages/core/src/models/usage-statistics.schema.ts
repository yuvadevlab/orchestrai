/**
 * @file packages/core/src/models/usage-statistics.schema.ts
 * @description Token consumption and execution cost telemetry schemas.
 */

import { z } from "zod";

/**
 * Token usage and cost metrics collected from model invocations.
 */
export const ModelUsageSchema = z
  .object({
    promptTokens: z
      .number()
      .int()
      .nonnegative()
      .describe("Number of prompt/input tokens processed"),
    completionTokens: z
      .number()
      .int()
      .nonnegative()
      .describe("Number of completion/output tokens generated"),
    totalTokens: z.number().int().nonnegative().describe("Sum of prompt and completion tokens"),
    estimatedCostUsd: z
      .number()
      .nonnegative()
      .default(0)
      .describe("Calculated estimated dollar cost"),
    durationMs: z
      .number()
      .nonnegative()
      .optional()
      .describe("Total roundtrip invocation latency in ms"),
  })
  .describe("Model token consumption and cost metrics");

export type ModelUsage = z.infer<typeof ModelUsageSchema>;
