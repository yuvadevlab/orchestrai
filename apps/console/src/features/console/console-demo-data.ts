/**
 * @fileoverview Console demo data: event sequences, prompts, and responses for
 * each selectable scenario (research, developer, multi-agent).
 * Mirrors the OrchestrAI Lovable reference mock data exactly.
 */

import {
  Bot,
  Database,
  FileCode2,
  GitBranch,
  Globe2,
  Network,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** All possible event status values in the execution event log. */
export type EventStatus = "done" | "active" | "waiting";

/** An individual event emitted during a live agent execution. */
export interface ExecutionEvent {
  id: string;
  agent: string;
  title: string;
  detail: string;
  meta: string;
  type: "think" | "plan" | "search" | "web" | "file" | "database" | "delegate" | "model";
}

/** A selectable console demo scenario. */
export type Demo = "research" | "developer" | "multi";

/** Config for one demo scenario: prompt, streamed response, and ordered events. */
export interface DemoConfig {
  label: string;
  prompt: string;
  response: string;
  events: ExecutionEvent[];
}

/** Lucide icon map keyed by event type. */
export const EVENT_ICONS: Record<ExecutionEvent["type"], LucideIcon> = {
  think: Sparkles,
  plan: GitBranch,
  search: Search,
  web: Globe2,
  file: FileCode2,
  database: Database,
  delegate: Network,
  model: Bot,
};

/** All three demo scenarios, verbatim from the Lovable reference. */
export const DEMOS: Record<Demo, DemoConfig> = {
  research: {
    label: "Research",
    prompt: "Research PostgreSQL indexing strategies for high-write applications.",
    response:
      "For write-heavy PostgreSQL systems, index restraint is the primary optimization. Keep the minimum set supporting critical reads, prefer partial indexes for hot subsets, and use BRIN for naturally ordered append-only data. Validate each index against pg_stat_user_indexes and write amplification before production rollout.",
    events: [
      {
        id: "r1",
        agent: "Orchestrator",
        title: "Understanding the request",
        detail: "Separating write-path constraints, query patterns, and operational trade-offs.",
        meta: "intent · 0.4s",
        type: "think",
      },
      {
        id: "r2",
        agent: "Planner",
        title: "Creating execution plan",
        detail: "Four objectives identified: evidence, benchmarks, conflicts, synthesis.",
        meta: "4 steps · 0.8s",
        type: "plan",
      },
      {
        id: "r3",
        agent: "Research Agent",
        title: "Searching PostgreSQL documentation",
        detail: 'Query: "high-write workload indexing PostgreSQL BRIN partial indexes"',
        meta: "7 sources · 1.4s",
        type: "search",
      },
      {
        id: "r4",
        agent: "Browser",
        title: "Reading index documentation",
        detail: "postgresql.org/docs/current/indexes.html",
        meta: "14.2 KB · 1.8s",
        type: "web",
      },
      {
        id: "r5",
        agent: "Knowledge",
        title: "Retrieving benchmark evidence",
        detail: "Comparing 12 relevant chunks against source documentation.",
        meta: "0.91 relevance",
        type: "model",
      },
      {
        id: "r6",
        agent: "Analyst",
        title: "Resolving conflicting guidance",
        detail: "Testing partial, covering, and BRIN recommendations against write amplification.",
        meta: "3 comparisons",
        type: "think",
      },
      {
        id: "r7",
        agent: "Synthesis",
        title: "Composing recommendation",
        detail: "Converting evidence into a prioritized production strategy.",
        meta: "Qwen 8B · streaming",
        type: "model",
      },
    ],
  },
  developer: {
    label: "API review",
    prompt: "Review my API architecture.",
    response:
      "The API boundary is coherent, but billing, search, and notifications share a synchronous write path. Introduce explicit module contracts first, isolate side effects behind an outbox, and only extract services where ownership or scaling differs. This reduces blast radius without premature distributed complexity.",
    events: [
      {
        id: "d1",
        agent: "Orchestrator",
        title: "Understanding architecture scope",
        detail: "Identifying entry points, boundaries, persistence, and runtime dependencies.",
        meta: "intent · 0.3s",
        type: "think",
      },
      {
        id: "d2",
        agent: "Developer Agent",
        title: "Inspecting repository",
        detail: "Found 47 TypeScript files across API modules and shared packages.",
        meta: "47 files · 0.9s",
        type: "file",
      },
      {
        id: "d3",
        agent: "Filesystem",
        title: "Reading application boundaries",
        detail: "package.json · apps/api/src/modules · src/start.ts",
        meta: "3 files · 18.2 KB",
        type: "file",
      },
      {
        id: "d4",
        agent: "Developer Agent",
        title: "Tracing dependencies",
        detail: "Mapping imports, persistence boundaries, and synchronous coupling.",
        meta: "26 edges",
        type: "plan",
      },
      {
        id: "d5",
        agent: "Database",
        title: "Inspecting data model",
        detail: "Reviewing transaction ownership and schema coupling without exposing records.",
        meta: "11 models · 42ms",
        type: "database",
      },
      {
        id: "d6",
        agent: "Architect",
        title: "Building architecture map",
        detail: "Scoring boundaries against deployment and failure isolation.",
        meta: "3 bottlenecks",
        type: "model",
      },
      {
        id: "d7",
        agent: "Synthesis",
        title: "Generating recommendations",
        detail: "Prioritizing low-risk structural improvements.",
        meta: "Qwen 8B · streaming",
        type: "model",
      },
    ],
  },
  multi: {
    label: "Multi-agent",
    prompt: "Analyze this software architecture and research better alternatives.",
    response:
      "The current monolith couples billing, search, and notifications behind one deploy surface. A modular monolith with an outbox is the strongest near-term alternative: it isolates boundaries while preserving operational simplicity. Reassess service extraction after measuring workload ownership and independent scaling needs.",
    events: [
      {
        id: "m1",
        agent: "Supervisor",
        title: "Decomposing the objective",
        detail: "Creating parallel research, code, and data workstreams.",
        meta: "3 branches · 0.5s",
        type: "plan",
      },
      {
        id: "m2",
        agent: "Supervisor",
        title: "Delegating parallel work",
        detail: "Research → alternatives · Developer → boundaries · Data → runtime evidence",
        meta: "3 agents · 0.4s",
        type: "delegate",
      },
      {
        id: "m3",
        agent: "Research Agent",
        title: "Comparing architecture patterns",
        detail: "Event-driven, modular monolith, and service-oriented alternatives.",
        meta: "9 sources · 2.1s",
        type: "search",
      },
      {
        id: "m4",
        agent: "Developer Agent",
        title: "Inspecting repository",
        detail: "Tracing service contracts, imports, and shared write paths.",
        meta: "47 files · 1.6s",
        type: "file",
      },
      {
        id: "m5",
        agent: "Data Agent",
        title: "Sampling runtime evidence",
        detail: "Read-only aggregate over latency and dependency traces.",
        meta: "approval required",
        type: "database",
      },
      {
        id: "m6",
        agent: "Supervisor",
        title: "Reconciling agent findings",
        detail: "Comparing operational cost, failure isolation, and migration risk.",
        meta: "3 reports",
        type: "think",
      },
      {
        id: "m7",
        agent: "Synthesis",
        title: "Producing architecture decision",
        detail: "Combining evidence into a phased recommendation.",
        meta: "Qwen 8B · streaming",
        type: "model",
      },
    ],
  },
};
