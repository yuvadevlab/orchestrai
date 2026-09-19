/**
 * @fileoverview Mock database workflow templates and DAG nodes.
 * Adheres strictly to the 250-line maximum rule.
 */

import type { Workflow } from "./types";

/**
 * Pre-composed visual orchestration workflows with multi-lane DAG specifications.
 */
export const workflows: Workflow[] = [
  {
    id: "WF-01",
    name: "Architecture review",
    description:
      "Parallel research, code, and data branches reconciled by the supervisor with an approval gate on data access.",
    status: "published",
    runs: 128,
    successRate: 96.1,
    nodes: [
      { id: "n1", label: "Intent received", type: "start", lane: 0 },
      { id: "n2", label: "Supervisor plan", type: "agent", lane: 1 },
      { id: "n3", label: "Fan out", type: "parallel", lane: 2 },
      { id: "n4", label: "Research Agent", type: "agent", lane: 3 },
      { id: "n5", label: "Developer Agent", type: "agent", lane: 3 },
      { id: "n6", label: "Data approval", type: "approval", lane: 3 },
      { id: "n7", label: "Evidence sufficient?", type: "condition", lane: 4 },
      { id: "n8", label: "Synthesis", type: "agent", lane: 5 },
      { id: "n9", label: "Response delivered", type: "end", lane: 6 },
    ],
  },
  {
    id: "WF-02",
    name: "Knowledge ingestion",
    description:
      "Chunk, embed, and verify new documents, escalating malformed files for manual review.",
    status: "published",
    runs: 341,
    successRate: 92.4,
    nodes: [
      { id: "n1", label: "Upload detected", type: "start", lane: 0 },
      { id: "n2", label: "Parser tool", type: "tool", lane: 1 },
      { id: "n3", label: "Structure valid?", type: "condition", lane: 2 },
      { id: "n4", label: "Embed chunks", type: "tool", lane: 3 },
      { id: "n5", label: "Indexed", type: "end", lane: 4 },
    ],
  },
  {
    id: "WF-03",
    name: "Nightly evaluation",
    description: "Runs the regression suite across every agent and publishes a scorecard.",
    status: "draft",
    runs: 12,
    successRate: 100,
    nodes: [
      { id: "n1", label: "Scheduled trigger", type: "start", lane: 0 },
      { id: "n2", label: "Fan out agents", type: "parallel", lane: 1 },
      { id: "n3", label: "Eval harness", type: "tool", lane: 2 },
      { id: "n4", label: "Scorecard", type: "end", lane: 3 },
    ],
  },
];
