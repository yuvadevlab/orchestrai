/**
 * @fileoverview Mock database system events, evaluations, and activity feed.
 * Adheres strictly to the 250-line maximum rule.
 */

import type { SystemEvent, Evaluation, ActivityItem } from "./types";

/**
 * Live event bus messages.
 */
export const systemEvents: SystemEvent[] = [
  {
    id: "EV-5501",
    type: "approval.requested",
    executionId: "EXE-8F29A",
    source: "data-agent",
    status: "warn",
    at: "12:42:08",
    payload: { tool: "postgres.query", scope: "read-only aggregate", rows: "est. 41k" },
  },
  {
    id: "EV-5500",
    type: "agent.started",
    executionId: "EXE-8F29A",
    source: "supervisor",
    status: "ok",
    at: "12:41:06",
    payload: { agents: ["research", "developer", "data"] },
  },
  {
    id: "EV-5499",
    type: "execution.started",
    executionId: "EXE-8F29A",
    source: "orchestrator",
    status: "ok",
    at: "12:41:02",
    payload: { mode: "delegated", model: "qwen-8b" },
  },
  {
    id: "EV-5498",
    type: "message.completed",
    executionId: "EXE-7C104",
    source: "synthesis",
    status: "ok",
    at: "11:03:02",
    payload: { tokens: 1204, cited: 7 },
  },
  {
    id: "EV-5497",
    type: "tool.failed",
    executionId: "EXE-7C104",
    source: "browser.read",
    status: "error",
    at: "11:02:51",
    payload: { url: "postgresql.org/docs", error: "timeout after 5s", retry: 1 },
  },
  {
    id: "EV-5496",
    type: "tool.completed",
    executionId: "EXE-7C104",
    source: "web.search",
    status: "ok",
    at: "11:02:47",
    payload: { results: 7, latency: "1.4s" },
  },
  {
    id: "EV-5495",
    type: "execution.failed",
    executionId: "EXE-5A902",
    source: "orchestrator",
    status: "error",
    at: "18:20:08",
    payload: { reason: "approval.rejected" },
  },
  {
    id: "EV-5494",
    type: "approval.rejected",
    executionId: "EXE-5A902",
    source: "operator",
    status: "warn",
    at: "18:20:07",
    payload: { tool: "postgres.query", reason: "exceeds read budget" },
  },
];

/**
 * Scored evaluations measuring agent accuracy and completion.
 */
export const evaluations: Evaluation[] = [
  {
    id: "EVAL-31",
    name: "Research regression suite",
    agent: "Research Agent",
    score: 91.4,
    latency: "18.9s",
    toolSelection: 94,
    ragRetrieval: 89,
    taskCompletion: 92,
    cases: 48,
    ranAt: "Today 06:00",
  },
  {
    id: "EVAL-30",
    name: "Developer boundary suite",
    agent: "Developer Agent",
    score: 87.2,
    latency: "27.4s",
    toolSelection: 90,
    ragRetrieval: 78,
    taskCompletion: 88,
    cases: 36,
    ranAt: "Today 06:00",
  },
  {
    id: "EVAL-29",
    name: "Delegation correctness",
    agent: "General Agent",
    score: 95.8,
    latency: "12.1s",
    toolSelection: 97,
    ragRetrieval: 93,
    taskCompletion: 96,
    cases: 60,
    ranAt: "Yesterday 06:00",
  },
  {
    id: "EVAL-28",
    name: "Data safety gates",
    agent: "Data Agent",
    score: 99.1,
    latency: "7.8s",
    toolSelection: 99,
    ragRetrieval: 96,
    taskCompletion: 99,
    cases: 24,
    ranAt: "Yesterday 06:00",
  },
];

/**
 * Real-time audit activity stream.
 */
export const activityFeed: ActivityItem[] = [
  {
    id: "AC-801",
    title: "Developer Agent requested approval",
    detail: "Read-only aggregate over performance traces on EXE-8F29A.",
    kind: "approval",
    at: "2 minutes ago",
  },
  {
    id: "AC-800",
    title: "Supervisor delegated 3 branches",
    detail: "Research, Developer, and Data agents dispatched in parallel.",
    kind: "execution",
    at: "3 minutes ago",
  },
  {
    id: "AC-799",
    title: "Research Agent completed execution",
    detail: "EXE-7C104 finished in 18.4s with 7 cited sources.",
    kind: "execution",
    at: "1 hour ago",
  },
  {
    id: "AC-798",
    title: "Knowledge document indexed",
    detail: "postgres-indexing-guide.pdf embedded into 428 chunks.",
    kind: "knowledge",
    at: "1 hour ago",
  },
  {
    id: "AC-797",
    title: "Memory updated",
    detail: "Long-term record added: deployment model is a single Workers surface.",
    kind: "memory",
    at: "3 hours ago",
  },
  {
    id: "AC-796",
    title: "Tool configuration changed",
    detail: "shell.exec disabled by operator policy.",
    kind: "config",
    at: "Yesterday",
  },
  {
    id: "AC-795",
    title: "Data Agent paused",
    detail: "Agent paused pending review of the rejected aggregate request.",
    kind: "agent",
    at: "Yesterday",
  },
];
