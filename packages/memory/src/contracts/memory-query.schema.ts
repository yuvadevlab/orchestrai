/**
 * @file packages/memory/src/contracts/memory-query.schema.ts
 * @description Zod schemas and query types for filtering and searching memory stores.
 */

import { z } from "zod";
import { MemoryTypeSchema } from "./memory-type.schema";

/**
 * Filter criteria for deterministic listing of memory items.
 */
export const MemoryFilterSchema = z
  .object({
    tenantId: z.uuid().describe("Tenant isolation scope"),
    agentId: z.uuid().optional().describe("Agent isolation scope"),
    conversationId: z.uuid().optional().describe("Conversation thread scope"),
    memoryTypes: z
      .array(MemoryTypeSchema)
      .optional()
      .describe("Subset of memory types to retrieve"),
    since: z.iso
      .datetime()
      .optional()
      .describe("Only return memories created after this timestamp"),
    limit: z.number().int().positive().max(100).default(20).describe("Maximum records to return"),
    offset: z.number().int().nonnegative().default(0).describe("Offset for pagination"),
  })
  .strict();

export type MemoryFilter = z.infer<typeof MemoryFilterSchema>;

/**
 * Semantic vector similarity search query specification.
 */
export const MemorySearchQuerySchema = z
  .object({
    tenantId: z.uuid().describe("Tenant scope"),
    agentId: z.uuid().optional().describe("Optional agent filter"),
    query: z.string().min(1).describe("Text search prompt"),
    embedding: z
      .array(z.number())
      .optional()
      .describe("Query embedding vector for cosine similarity matching"),
    memoryTypes: z
      .array(MemoryTypeSchema)
      .optional()
      .describe("Filter by specific memory classifications"),
    minScore: z.number().min(0).max(1).default(0.7).describe("Minimum cosine similarity threshold"),
    limit: z.number().int().positive().max(50).default(10).describe("Max results to return"),
  })
  .strict();

export type MemorySearchQuery = z.infer<typeof MemorySearchQuerySchema>;
