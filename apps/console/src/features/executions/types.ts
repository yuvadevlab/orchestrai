/**
 * Execution DAG status state.
 */
export type ExecutionStatus = "COMPLETED" | "RUNNING" | "FAILED" | "PAUSED";

/**
 * Historical or active execution DAG record.
 */
export interface ExecutionRun {
  id: string;
  intent: string;
  status: ExecutionStatus;
  primaryAgent: string;
  stepsCompleted: number;
  totalSteps: number;
  latencyMs: number;
  tokensUsed: number;
  createdAt: string;
}
