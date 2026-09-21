/**
 * @file packages/memory/src/episodic/episode.types.ts
 * @description Type definitions for discrete agent execution episodes and reflection records.
 */

import { z } from "zod";

/**
 * Zod schema for structured episode execution summaries.
 */
export const EpisodeRecordSchema = z
  .object({
    episodeId: z.string().uuid().describe("Unique identifier for this episode"),
    tenantId: z.string().uuid().describe("Tenant ID"),
    agentId: z.string().uuid().describe("Agent ID"),
    executionId: z.string().uuid().describe("Execution run ID"),
    goal: z.string().min(1).describe("Target objective or instruction requested by user"),
    actionsSummary: z
      .array(z.string())
      .default([])
      .describe("Key tool actions executed during the episode"),
    outcome: z.enum(["SUCCESS", "FAILURE", "ABORTED"]).describe("Final outcome of the episode"),
    reflections: z
      .string()
      .optional()
      .describe("Agent reflection or retrospective analysis for future reuse"),
    timestamp: z.string().datetime().describe("ISO timestamp when the episode finished"),
  })
  .strict();

export type EpisodeRecord = z.infer<typeof EpisodeRecordSchema>;
