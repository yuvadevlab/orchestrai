/**
 * @fileoverview Mock database registered tools and model providers.
 * Adheres strictly to the 250-line maximum rule.
 */

import type { Tool, Model } from "./types";

/**
 * Registered tool registry capabilities.
 */
export const tools: Tool[] = [
  {
    id: "postgres.query",
    name: "Postgres Query",
    category: "Database",
    description:
      "Executes parameterized, read-only SQL queries with automatic EXPLAIN cost checks.",
    permissions: ["read", "approval-gated"],
    status: "requires-approval",
    calls30d: 1420,
    avgLatency: "24ms",
  },
  {
    id: "web.search",
    name: "Web Search",
    category: "Web",
    description: "Semantic web search with result deduplication and source verification.",
    permissions: ["network"],
    status: "enabled",
    calls30d: 4890,
    avgLatency: "420ms",
  },
  {
    id: "browser.read",
    name: "Page Reader",
    category: "Web",
    description: "Fetches and extracts readable content from a single URL.",
    permissions: ["network"],
    status: "enabled",
    calls30d: 2106,
    avgLatency: "1.8s",
  },
  {
    id: "code.analyze",
    name: "Code Analyzer",
    category: "Developer",
    description: "Builds dependency graphs and detects boundary violations.",
    permissions: ["read"],
    status: "enabled",
    calls30d: 488,
    avgLatency: "640ms",
  },
  {
    id: "shell.exec",
    name: "Shell Exec",
    category: "System",
    description: "Runs allow-listed commands inside the sandbox.",
    permissions: ["execute", "approval-gated"],
    status: "disabled",
    calls30d: 0,
    avgLatency: "—",
  },
  {
    id: "slack.post",
    name: "Slack Message",
    category: "Communication",
    description: "Posts run summaries into a configured channel.",
    permissions: ["write", "network"],
    status: "enabled",
    calls30d: 174,
    avgLatency: "310ms",
  },
  {
    id: "rag.retrieve",
    name: "Knowledge Retrieval",
    category: "Data",
    description: "Semantic retrieval across the indexed knowledge base.",
    permissions: ["read"],
    status: "enabled",
    calls30d: 3522,
    avgLatency: "180ms",
  },
];

/**
 * Model reasoning engine options.
 */
export const models: Model[] = [
  {
    id: "qwen-8b",
    name: "Qwen 8B",
    provider: "Ollama (local)",
    availability: "available",
    context: "128K",
    streaming: true,
    toolCalling: true,
    structuredOutput: true,
    role: "Primary reasoning & synthesis",
    latency: "310ms / 1st token",
  },
  {
    id: "qwen-3b",
    name: "Qwen 3B",
    provider: "Ollama (local)",
    availability: "available",
    context: "32K",
    streaming: true,
    toolCalling: true,
    structuredOutput: false,
    role: "Fast routing & classification",
    latency: "90ms / 1st token",
  },
  {
    id: "bge-m3",
    name: "BGE-M3",
    provider: "Ollama (local)",
    availability: "available",
    context: "8K",
    streaming: false,
    toolCalling: false,
    structuredOutput: false,
    role: "Embeddings for retrieval",
    latency: "22ms / chunk",
  },
  {
    id: "llama-70b",
    name: "Llama 70B",
    provider: "Remote gateway",
    availability: "degraded",
    context: "128K",
    streaming: true,
    toolCalling: true,
    structuredOutput: true,
    role: "Escalation for long synthesis",
    latency: "1.2s / 1st token",
  },
  {
    id: "whisper-l",
    name: "Whisper Large",
    provider: "Ollama (local)",
    availability: "offline",
    context: "—",
    streaming: false,
    toolCalling: false,
    structuredOutput: false,
    role: "Speech transcription",
    latency: "—",
  },
];
