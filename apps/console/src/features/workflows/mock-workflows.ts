import type { WorkflowDefinition } from "./types";

/**
 * Mock workflow definitions for visual canvas presentation.
 */
export const MOCK_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "wf_rag",
    name: "RAG Ingestion & Chunking Pipeline",
    nodes: 6,
    status: "ACTIVE",
    description:
      "Splits raw markdown documents, creates embeddings, and stores vectors in pgvector.",
  },
  {
    id: "wf_eval",
    name: "Offline Benchmark Evaluation Suite",
    nodes: 4,
    status: "DRAFT",
    description:
      "Runs synthetic test cases against agent definitions to evaluate hallucination scores.",
  },
  {
    id: "wf_pr",
    name: "Pull Request Architecture Linter",
    nodes: 8,
    status: "ACTIVE",
    description:
      "Evaluates diffs against 250-line invariant, package boundaries, and cyclomatic complexity.",
  },
];
