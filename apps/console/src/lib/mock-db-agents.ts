/**
 * @fileoverview Mock database specialist and supervisor agents.
 * Ordered and styled to match the OrchestrAI Lovable reference UI.
 * Adheres strictly to the 250-line maximum rule.
 */

import type { Agent } from "./types";

/**
 * Pre-configured specialist and supervisor agents.
 * Ordered: General → Research → Developer → Data → Personal
 * (matches the Lovable reference ordering and glyph set).
 */
export const agents: Agent[] = [
  {
    id: "general",
    name: "General Agent",
    role: "Routing & synthesis",
    glyph: "◉",
    status: "active",
    description:
      "Interprets intent, selects the right specialist, and composes the final answer with citations from every branch of the run.",
    model: "Qwen 8B (Ollama)",
    mode: "autonomous",
    capabilities: ["Intent routing", "Planning", "Synthesis", "Citation assembly"],
    tools: ["web.search", "rag.retrieve", "agent.delegate"],
    instructions:
      "Always clarify ambiguous scope before planning. Prefer delegation when a specialist owns the domain. Cite every external claim.",
    stats: { executions: 1284, successRate: 97.4, avgDuration: "14.2s", tokens: "8.4M" },
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Evidence gathering",
    glyph: "◈",
    status: "active",
    description:
      "Searches, reads, and reconciles external sources, then grades evidence quality before passing findings upstream.",
    model: "Qwen 8B (Ollama)",
    mode: "delegated",
    capabilities: ["Web search", "Page reading", "Source grading", "Conflict resolution"],
    tools: ["web.search", "browser.read", "rag.retrieve"],
    instructions: "Prefer primary documentation. Flag contradictions rather than averaging them.",
    stats: { executions: 642, successRate: 95.1, avgDuration: "22.8s", tokens: "5.1M" },
  },
  {
    id: "developer",
    name: "Developer Agent",
    role: "Code & architecture",
    glyph: "◆",
    status: "active",
    description:
      "Inspects repositories, traces dependency graphs, and produces structural recommendations grounded in the real codebase.",
    model: "Qwen 8B (Ollama)",
    mode: "supervised",
    capabilities: [
      "Repository inspection",
      "Dependency tracing",
      "Architecture review",
      "Diff proposals",
    ],
    tools: ["fs.read", "git.log", "code.analyze"],
    instructions:
      "Never propose a refactor without naming the files it touches and the risk it carries.",
    stats: { executions: 418, successRate: 93.8, avgDuration: "31.6s", tokens: "6.7M" },
  },
  {
    id: "data",
    name: "Data Agent",
    role: "Query & analysis",
    glyph: "▣",
    status: "paused",
    description:
      "Runs read-only aggregates over operational stores. Every query above the read threshold requests human approval first.",
    model: "Qwen 8B (Ollama)",
    mode: "supervised",
    capabilities: ["SQL aggregates", "Trace sampling", "Anomaly detection"],
    tools: ["postgres.query", "metrics.read"],
    instructions:
      "Aggregate only. Never surface row-level records. Request approval before any cross-table scan.",
    stats: { executions: 219, successRate: 98.6, avgDuration: "8.9s", tokens: "1.9M" },
  },
  {
    id: "personal",
    name: "Personal Agent",
    role: "Context & continuity",
    glyph: "◐",
    status: "idle",
    description:
      "Maintains working memory across sessions so long-running objectives keep their context between executions.",
    model: "Qwen 8B (Ollama)",
    mode: "autonomous",
    capabilities: ["Working memory", "Preference recall", "Scheduling"],
    tools: ["memory.write", "memory.search", "calendar.read"],
    instructions:
      "Store durable facts only. Expire anything session-specific after the run completes.",
    stats: { executions: 96, successRate: 99.0, avgDuration: "4.1s", tokens: "0.4M" },
  },
];
