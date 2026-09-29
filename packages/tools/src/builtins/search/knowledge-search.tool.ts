/**
 * @file packages/tools/src/builtins/search/knowledge-search.tool.ts
 * @description Safe semantic retrieval tool searching ingested vector knowledge bases.
 * @module @orchestrai/tools/builtins/search
 */

import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ToolDefinition } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";

/**
 * Result chunk returned by semantic knowledge retrieval.
 */
export interface KnowledgeSearchResultChunk {
  readonly chunkId: string;
  readonly content: string;
  readonly score: number;
  readonly metadata: Record<string, unknown>;
}

/**
 * Functional retriever contract for querying semantic knowledge stores.
 */
export type KnowledgeSearchFunction = (
  query: string,
  limit?: number,
  minScore?: number,
) => Promise<KnowledgeSearchResultChunk[]>;

/**
 * Input arguments schema for KnowledgeSearchTool.
 */
export const KnowledgeSearchInputSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .describe("Semantic search question or keywords to search across ingested documentation"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Maximum number of relevant document passages to retrieve"),
  minScore: z
    .number()
    .min(0)
    .max(1)
    .default(0.3)
    .describe("Minimum similarity relevance threshold (0.0 - 1.0)"),
});

export type KnowledgeSearchInput = z.infer<typeof KnowledgeSearchInputSchema>;

/**
 * Output shape returned by KnowledgeSearchTool.
 */
export interface KnowledgeSearchOutput {
  readonly query: string;
  readonly resultCount: number;
  readonly results: readonly KnowledgeSearchResultChunk[];
  readonly contextText: string;
}

/**
 * Built-in tool for querying ingested documents and RAG knowledge bases.
 */
export class KnowledgeSearchTool implements ITool<KnowledgeSearchInput, KnowledgeSearchOutput> {
  public readonly definition: ToolDefinition = {
    name: "knowledge_search",
    description:
      "Performs semantic hybrid search across uploaded and indexed project documentation, guides, and knowledge stores. Returns relevant passages with similarity scores.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    parametersSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search question or keywords to look up",
        },
        limit: {
          type: "integer",
          default: 5,
          description: "Max results to return",
        },
        minScore: {
          type: "number",
          default: 0.3,
          description: "Minimum relevance score",
        },
      },
      required: ["query"],
    },
    timeoutMs: 15_000,
    isDestructive: false,
  };

  public readonly inputSchema = KnowledgeSearchInputSchema;

  constructor(private readonly retriever?: KnowledgeSearchFunction) {}

  /**
   * Executes semantic search against the configured knowledge store.
   */
  async execute(
    args: KnowledgeSearchInput,
    _context: ToolExecutionContext,
  ): Promise<KnowledgeSearchOutput> {
    if (!this.retriever) {
      return {
        query: args.query,
        resultCount: 0,
        results: [],
        contextText: "No internal knowledge base attached or indexed.",
      };
    }

    const items = await this.retriever(args.query, args.limit, args.minScore);
    const contextText = items
      .map(
        (item, index) =>
          `[Passage ${index + 1} | Score: ${(item.score * 100).toFixed(1)}%]:\n${item.content}`,
      )
      .join("\n\n");

    return {
      query: args.query,
      resultCount: items.length,
      results: items,
      contextText:
        contextText || "No matching passages found with the specified relevance threshold.",
    };
  }
}
