import type { AgentDefinition } from "./types";

/**
 * Pre-configured mock agents running on the OrchestrAI platform.
 */
export const MOCK_AGENTS: AgentDefinition[] = [
  {
    id: "agent_orchestrator",
    name: "DAG Orchestrator",
    role: "System Coordinator",
    model: "claude-3-7-sonnet",
    status: "ACTIVE",
    tools: ["delegate_task", "checkpoint_state", "evaluate_dag"],
    description:
      "Decomposes high-level intent into deterministic DAG execution graphs and checkpoint steps.",
    totalExecutions: 1420,
    successRate: 99.8,
    averageLatencyMs: 410,
  },
  {
    id: "agent_research",
    name: "Research Specialist",
    role: "Information Synthesis",
    model: "gpt-4o",
    status: "ACTIVE",
    tools: ["web_search", "fetch_url", "vector_search"],
    description:
      "Performs deep contextual search against pgvector knowledge bases and external documentation.",
    totalExecutions: 890,
    successRate: 99.1,
    averageLatencyMs: 1240,
  },
  {
    id: "agent_developer",
    name: "Code Engineer",
    role: "Implementation & Refactoring",
    model: "claude-3-7-sonnet",
    status: "ACTIVE",
    tools: ["read_file", "write_file", "git_commit", "run_linter"],
    description:
      "Generates robust TypeScript code adhering strictly to 250-line maximum rule and strict typing.",
    totalExecutions: 2150,
    successRate: 99.5,
    averageLatencyMs: 890,
  },
  {
    id: "agent_database",
    name: "PostgreSQL DBA",
    role: "Data & Schema Specialist",
    model: "claude-3-5-haiku",
    status: "IDLE",
    tools: ["explain_query", "verify_migration", "inspect_locks"],
    description:
      "Audits SQL query plans, verifies transactional outbox atomicity, and monitors HNSW vector indexes.",
    totalExecutions: 430,
    successRate: 100.0,
    averageLatencyMs: 310,
  },
  {
    id: "agent_critic",
    name: "Security & Quality Critic",
    role: "Consensus Validator",
    model: "gpt-4o-mini",
    status: "ACTIVE",
    tools: ["ast_security_scan", "verify_line_counts"],
    description:
      "Guarantees no file exceeds 250 lines and enforces conventional commit specifications.",
    totalExecutions: 1670,
    successRate: 99.9,
    averageLatencyMs: 250,
  },
];
