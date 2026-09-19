import type { DemoScenario, DemoType, ConsoleTelemetry } from "./types";

/**
 * Default telemetry metrics for Console header display.
 */
export const DEFAULT_TELEMETRY: ConsoleTelemetry = {
  activeAgents: 5,
  tokensProcessed: 142850,
  averageLatencyMs: 340,
  successRate: 99.4,
};

/**
 * Pre-configured demo scenarios illustrating agent DAG orchestration.
 */
export const DEMO_SCENARIOS: Record<DemoType, DemoScenario> = {
  research: {
    label: "Deep Research",
    prompt: "Research PostgreSQL indexing strategies for high-write applications.",
    response:
      "For write-heavy PostgreSQL systems, index restraint is the primary optimization. Keep the minimum set supporting critical reads, prefer partial indexes for hot subsets, and use BRIN for naturally ordered append-only data. Validate each index against pg_stat_user_indexes and write amplification before production rollout.",
    events: [
      {
        id: "r1",
        agent: "Orchestrator",
        title: "Understanding request context",
        detail: "Separating write-path constraints, query patterns, and operational trade-offs.",
        meta: "intent · 0.4s",
        type: "think",
      },
      {
        id: "r2",
        agent: "Planner",
        title: "Synthesizing execution plan",
        detail:
          "Four objectives identified: evidence retrieval, benchmark comparison, conflict detection, synthesis.",
        meta: "4 steps · 0.8s",
        type: "plan",
      },
      {
        id: "r3",
        agent: "Research Agent",
        title: "Querying pgvector documentation",
        detail: 'Query: "high-write workload indexing PostgreSQL BRIN partial indexes"',
        meta: "7 sources · 1.4s",
        type: "search",
      },
      {
        id: "r4",
        agent: "Critic Agent",
        title: "Verifying write-amplification bounds",
        detail: "Confirmed WAL pressure metrics align with WAL buffer size specifications.",
        meta: "verified · 0.5s",
        type: "model",
      },
    ],
  },
  developer: {
    label: "API Scaffolding",
    prompt: "Implement BullMQ queue worker with exponential backoff and dead-letter routing.",
    response:
      "Worker daemon successfully provisioned with Full Jitter backoff algorithm, Redis connection pooling with null retries, and comprehensive error telemetry routing to the dead-letter queue.",
    events: [
      {
        id: "d1",
        agent: "Developer Agent",
        title: "Analyzing Redis connection topology",
        detail: "Verifying BullMQ maxRetriesPerRequest requirement.",
        meta: "config · 0.2s",
        type: "think",
      },
      {
        id: "d2",
        agent: "Developer Agent",
        title: "Generating backoff jitter math",
        detail: "calculateBackoffWithJitter formula implemented with min/max bounds.",
        meta: "code · 0.6s",
        type: "file",
      },
      {
        id: "d3",
        agent: "Tester Agent",
        title: "Running vitest unit assertions",
        detail: "3 test suites passed: connection, backpressure, and dead-letter.",
        meta: "pass · 1.1s",
        type: "delegate",
      },
    ],
  },
  multi: {
    label: "Multi-Agent Governance",
    prompt: "Perform automated pull request security and architecture audit.",
    response:
      "Audit complete. PR #104 satisfies all strict invariants: 250-line rule verified, zero ESLint warnings, typechecks passed, and PostgreSQL transaction boundaries safely wrapped.",
    events: [
      {
        id: "m1",
        agent: "Security Sentinel",
        title: "Scanning AST for SQL injection vectors",
        detail:
          "AST parsed 18 SQL statements; all parameters properly bound via parameterized queries.",
        meta: "secure · 0.9s",
        type: "database",
      },
      {
        id: "m2",
        agent: "Architecture Guard",
        title: "Auditing 250-line maximum rule",
        detail: "Checked 14 files across apps/worker. Maximum line count: 164 lines.",
        meta: "passed · 0.3s",
        type: "think",
      },
      {
        id: "m3",
        agent: "Lead Reviewer",
        title: "Generating sign-off certificate",
        detail: "Cryptographic signature generated and added to deployment audit log.",
        meta: "signed · 0.4s",
        type: "model",
      },
    ],
  },
};
