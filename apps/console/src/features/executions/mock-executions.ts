import type { ExecutionRun } from "./types";

/**
 * Historical execution runs recorded by the runtime persistence layer.
 */
export const MOCK_EXECUTIONS: ExecutionRun[] = [
  {
    id: "exec_01HQ89745BNWZ",
    intent: "Research PostgreSQL indexing strategies for high-write applications",
    status: "COMPLETED",
    primaryAgent: "Research Specialist",
    stepsCompleted: 6,
    totalSteps: 6,
    latencyMs: 1420,
    tokensUsed: 2310,
    createdAt: "2 mins ago",
  },
  {
    id: "exec_01HQ89632XJKM",
    intent: "Generate BullMQ worker daemon with Full Jitter backoff and DLQ",
    status: "COMPLETED",
    primaryAgent: "Code Engineer",
    stepsCompleted: 4,
    totalSteps: 4,
    latencyMs: 980,
    tokensUsed: 3120,
    createdAt: "14 mins ago",
  },
  {
    id: "exec_01HQ89510PWZQ",
    intent: "Audit monorepo files against 250-line rule and generate AST diff",
    status: "RUNNING",
    primaryAgent: "Quality Sentinel",
    stepsCompleted: 3,
    totalSteps: 5,
    latencyMs: 640,
    tokensUsed: 1450,
    createdAt: "Just now",
  },
  {
    id: "exec_01HQ89401LKMA",
    intent: "Scrape external documentation without rate-limiting configuration",
    status: "FAILED",
    primaryAgent: "Research Specialist",
    stepsCompleted: 2,
    totalSteps: 5,
    latencyMs: 2400,
    tokensUsed: 890,
    createdAt: "1 hour ago",
  },
  {
    id: "exec_01HQ89312VBNM",
    intent: "Migrate database schema with pgvector 1536-dim embeddings table",
    status: "COMPLETED",
    primaryAgent: "PostgreSQL DBA",
    stepsCompleted: 3,
    totalSteps: 3,
    latencyMs: 510,
    tokensUsed: 1100,
    createdAt: "3 hours ago",
  },
];
