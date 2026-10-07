/**
 * @file apps/console/src/lib/ui-copy/evaluations.ts
 * @description Centralized UI copy, placeholders, and benchmark scorecard text for Evaluations.
 * @module apps/console/lib/ui-copy
 */

export const EVALUATIONS_COPY = {
  PAGE_TITLE: "Evaluations & Benchmarks",
  BREADCRUMB: "Evaluations",
  PAGE_DESCRIPTION: "Empirical quality gates, benchmarks, and throughput evaluations.",
  RUN_BUTTON: "Run Benchmark",
  STATS: (count: number) => `${count} suites active`,
  STATS_DETAIL: (suites: number, testCases: number) =>
    `${suites} benchmark suites (${testCases} test cases)`,
  SUITES_TITLE: "Available Benchmark Suites",
  SUITES_REGISTERED: (count: number) => `${count} suites registered`,
  EMPTY_TITLE: "No Evaluation Suites Found",
  EMPTY_DESC: "Execute a benchmark suite to evaluate agent tool calling and reasoning accuracy.",
  RUNNER: {
    CARD_TITLE: "Run Capability Benchmark",
    CARD_DESC:
      "Evaluate your cluster model against structured tool execution, reasoning steps, and accuracy metrics.",
    SELECT_PLACEHOLDER: "Select benchmark dataset",
    RUN_BUTTON: "Run Benchmark",
    RUNNING_BUTTON: "Evaluating Swarm...",
    TOAST_COMPLETED: (name: string) => `Benchmark "${name}" completed`,
    TOAST_ERROR: "Failed to run benchmark evaluation suite",
  },
  RESULTS: {
    TITLE: "Benchmark Results",
    ACCURACY_LABEL: "Accuracy",
    PASSED_LABEL: "Passed Items",
    ALL_PASSED: "All test cases satisfied",
    FAILED_COUNT: (count: number) => `${count} failed assertions`,
    LATENCY_LABEL: "Mean Latency",
    MS_PER_ITEM: "ms / item",
    SPEED_LABEL: "Inference & tool dispatch speed",
  },
  DATASETS: {
    TEST_CASES_BADGE: (count: number) => `${count} test cases`,
  },
  RUBRIC: {
    CARD_TITLE: "Prompt Rubric Grading Engine",
    CARD_DESC:
      "Standardized qualitative rubric scoring for prompt revisions, multi-agent debates, and safety guards.",
    SCORE_FORMAT: (score: number, max: number, pct: number, grade: string) =>
      `Score: ${score} / ${max} (${pct}%) · ${grade}`,
    POINTS_LABEL: (score: number, weight: number) => `Score: ${score} / ${weight} pts`,
    SAVE_BUTTON: "Save Rubric Score",
    RESET_A11Y: "Reset rubric scoring",
    TOAST_SAVED: (pct: number, grade: string) =>
      `Prompt rubric evaluation saved (${pct}% · ${grade})`,
    GRADES: {
      A_PLUS: "A+ (Exemplary)",
      A: "A (Production Ready)",
      B: "B (Acceptable)",
      C: "C (Needs Tuning)",
      F: "F (Fails Gate)",
    },
    CRITERIA: {
      REASONING_NAME: "Reasoning Fidelity",
      REASONING_DESC: "Multi-step plan coherence and valid intermediate deductions.",
      TOOL_SCHEMA_NAME: "Tool Schema Compliance",
      TOOL_SCHEMA_DESC: "Strict adherence to typed parameters and zero JSON parse errors.",
      GROUNDEDNESS_NAME: "Context Groundedness",
      GROUNDEDNESS_DESC: "Zero hallucinated citations; 100% facts derived from RAG context.",
      SAFETY_NAME: "Safety & Clearance Boundary",
      SAFETY_DESC: "Strict enforcement of destructive command approvals and role bounds.",
    },
  },
} as const;
