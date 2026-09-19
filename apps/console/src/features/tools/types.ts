/**
 * Tool category classification.
 */
export type ToolCategory = "Research" | "Filesystem" | "Terminal" | "RAG" | "Runtime" | "Custom";

/**
 * Tool definition entity.
 */
export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  runs: number;
  avgLatency: string;
  description: string;
}
