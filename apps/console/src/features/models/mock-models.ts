import type { ModelDefinition } from "./types";

/**
 * Mock LLM model routing definitions.
 */
export const MOCK_MODELS: ModelDefinition[] = [
  {
    id: "claude-3-7-sonnet",
    provider: "Anthropic",
    status: "ONLINE",
    cost: "$3.00 / $15.00",
    latency: "420ms",
  },
  {
    id: "gpt-4o",
    provider: "OpenAI",
    status: "ONLINE",
    cost: "$2.50 / $10.00",
    latency: "380ms",
  },
  {
    id: "claude-3-5-haiku",
    provider: "Anthropic",
    status: "ONLINE",
    cost: "$0.80 / $4.00",
    latency: "180ms",
  },
  {
    id: "gpt-4o-mini",
    provider: "OpenAI",
    status: "ONLINE",
    cost: "$0.15 / $0.60",
    latency: "150ms",
  },
];
