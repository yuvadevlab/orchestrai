/**
 * Execution DAG status state.
 */
export type ExecutionStatus =
  "COMPLETED" | "RUNNING" | "FAILED" | "PAUSED" | "CANCELLED" | "QUEUED";

/**
 * Step checkpoint summary within an execution DAG.
 */
export interface ExecutionStepTrace {
  stepIndex: number;
  nodeName: string;
  status: string;
  durationMs?: number;
  tokensUsed?: number;
  errorMessage?: string;
}

/**
 * Historical or active execution DAG record with human-readable and forensic debug metadata.
 */
export interface ExecutionRun {
  /** Execution unique identifier */
  id: string;
  /** Trace correlation identifier */
  traceId?: string;
  /** Human-readable intent or user objective */
  intent: string;
  /** Execution lifecycle state */
  status: ExecutionStatus;
  /** Raw agent identifier */
  agentId: string;
  /** Human-readable specialist agent name */
  agentName: string;
  /** Primary agent identifier or name alias for backward compatibility */
  primaryAgent: string;
  /** Agent role / category */
  agentRole: string;
  /** Underlying LLM model engine name */
  agentModel: string;
  /** Dispatch mode (auto, chat, plan, act) */
  mode: string;
  /** Associated conversation / session ID */
  conversationId?: string;
  /** Associated conversation title */
  conversationTitle?: string;
  /** Number of steps completed */
  stepsCompleted: number;
  /** Total expected or executed steps */
  totalSteps: number;
  /** Active or last executed graph node name */
  currentNode?: string;
  /** Failure error message or stack summary */
  errorMessage?: string;
  /** Execution elapsed duration in milliseconds */
  latencyMs: number;
  /** Formatted duration string (e.g. '1.4s', '350ms') */
  durationFormatted: string;
  /** Total tokens consumed */
  tokensUsed: number;
  /** ISO creation timestamp */
  createdAt: string;
  /** Human-readable relative time (e.g. '2m ago') */
  timeAgo: string;
  /** Raw execution payload or step traces for forensic inspection */
  steps?: ExecutionStepTrace[];
  /** Full raw JSON record for developer debugging */
  rawRecord?: Record<string, unknown>;
}
