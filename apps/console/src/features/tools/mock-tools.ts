import type { ToolDefinition } from "./types";

/**
 * Mock tool definitions for runtime environment catalog.
 */
export const MOCK_TOOLS: ToolDefinition[] = [
  {
    name: "web_search",
    category: "Research",
    runs: 4120,
    avgLatency: "120ms",
    description: "Search web queries and retrieve live search engine response markdown.",
  },
  {
    name: "read_file",
    category: "Filesystem",
    runs: 8940,
    avgLatency: "12ms",
    description: "Read utf-8 contents of local filesystem paths within permitted sandboxes.",
  },
  {
    name: "write_file",
    category: "Filesystem",
    runs: 2410,
    avgLatency: "18ms",
    description: "Write or overwrite content to workspace targets with diff validation.",
  },
  {
    name: "run_command",
    category: "Terminal",
    runs: 1890,
    avgLatency: "340ms",
    description: "Execute monitored shell processes with timeout bounds and stderr capture.",
  },
  {
    name: "vector_search",
    category: "RAG",
    runs: 3290,
    avgLatency: "85ms",
    description: "Cosine distance similarity retrieval against pgvector index tables.",
  },
  {
    name: "checkpoint_state",
    category: "Runtime",
    runs: 12400,
    avgLatency: "5ms",
    description: "Persist execution checkpoint state in transactional PostgreSQL outbox.",
  },
];
