/**
 * @file packages/memory/src/contracts/memory-item.schema.ts
 * @description Zod schema and TypeScript interfaces for memory records and scored items.
 */

import { z } from "zod";
import { MemoryTypeSchema } from "./memory-type.schema";

/**
 * Canonical Zod schema representing a single persisted memory record.
 */
export const MemoryItemSchema = z
  .object({
    memoryId: z.string().uuid().describe("Unique identifier for this memory item"),
    tenantId: z.string().uuid().describe("Tenant ID for multi-tenant isolation"),
    agentId: z.string().uuid().describe("Agent ID associated with this memory"),
    conversationId: z.string().uuid().optional().describe("Optional conversation thread ID"),
    memoryType: MemoryTypeSchema.describe("Classification tier of this memory"),
    content: z.string().min(1).describe("Textual payload of the memory"),
    embedding: z
      .array(z.number())
      .optional()
      .describe("1536-dimensional vector embedding for semantic search"),
    metadata: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Flexible metadata attributes and context tags"),
    importanceScore: z
      .number()
      .min(0)
      .max(1)
      .default(0.5)
      .describe("Importance priority score between 0.0 and 1.0"),
    expiresAt: z
      .string()
      .datetime()
      .optional()
      .describe("Optional ISO timestamp for TTL-based automatic expiration"),
    createdAt: z.string().datetime().describe("ISO timestamp when memory was created"),
    updatedAt: z.string().datetime().describe("ISO timestamp when memory was last updated"),
  })
  .strict();

export type MemoryItem = z.infer<typeof MemoryItemSchema>;

/**
 * Memory item enriched with a similarity relevance score.
 */
export interface ScoredMemoryItem {
  /** The underlying memory record */
  readonly item: MemoryItem;
  /** Normalized similarity relevance score (0.0 to 1.0) */
  readonly score: number;
}
