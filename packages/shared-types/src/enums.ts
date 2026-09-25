/**
 * @file packages/shared-types/src/enums.ts
 * @description Master catalog of domain enumerations used across apps and packages.
 */

/**
 * Operating mode governing agent autonomy, planning, and execution strategy.
 */
export enum AgentMode {
  /** Conversational focus with minimal, passive tool invocation */
  CHAT = "chat",
  /** Deconstructs goals into execution DAGs before tool invocation */
  PLAN = "plan",
  /** Autonomous tool execution loop with active safety limits */
  ACT = "act",
  /** Adaptive orchestrator that plans, executes, and verifies */
  AUTO = "auto",
}

/**
 * Lifecycle state machine status of an execution run.
 */
export enum ExecutionStatus {
  /** Execution job enqueued but not yet dispatched to a worker */
  QUEUED = "pending",
  /** Actively processing steps on a worker */
  RUNNING = "running",
  /** Suspended waiting for human operator approval */
  WAITING_FOR_APPROVAL = "suspended",
  /** Terminal state: all steps completed successfully */
  COMPLETED = "completed",
  /** Terminal state: unrecoverable execution failure */
  FAILED = "failed",
  /** Terminal state: explicitly aborted by client or operator */
  CANCELLED = "cancelled",
}

/**
 * Functional category of a single step within an execution run.
 */
export enum StepType {
  /** LLM prompt completion or chat round */
  MODEL_CALL = "MODEL_CALL",
  /** Execution of a registered tool */
  TOOL_EXECUTION = "TOOL_EXECUTION",
  /** State graph node transition */
  STATE_TRANSITION = "STATE_TRANSITION",
  /** Human approval gate wait state */
  APPROVAL = "APPROVAL",
}

/**
 * Lifecycle processing status of an individual execution step.
 */
export enum StepStatus {
  /** Step queued for execution */
  PENDING = "PENDING",
  /** Step actively executing */
  RUNNING = "RUNNING",
  /** Step finished successfully */
  COMPLETED = "COMPLETED",
  /** Step failed */
  FAILED = "FAILED",
  /** Step bypassed by conditional edge router */
  SKIPPED = "SKIPPED",
}

/**
 * Human-in-the-loop (HITL) approval status.
 */
export enum ApprovalStatus {
  /** Awaiting human operator response */
  PENDING = "pending",
  /** Cleared by operator to proceed */
  APPROVED = "approved",
  /** Rejected by operator */
  REJECTED = "rejected",
  /** Timed out without operator interaction */
  TIMED_OUT = "timed_out",
}

/**
 * Standard message author roles in conversation threads.
 */
export enum MessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
  TOOL = "tool",
}

/**
 * Supported model provider backend engines.
 */
export enum ModelProvider {
  OLLAMA = "ollama",
  ANTHROPIC = "anthropic",
  OPENAI = "openai",
  CUSTOM = "custom",
}

/**
 * Risk classification tier governing tool execution clearance.
 */
export enum ToolPermissionLevel {
  /** Zero external side-effects; always permitted */
  READ_ONLY = "read_only",
  /** Reversible or sandboxed local modifications */
  WRITE_SAFE = "write_safe",
  /** External network or non-destructive API updates */
  SENSITIVE = "sensitive",
  /** Destructive actions; unconditionally requires human approval */
  DANGEROUS = "dangerous",
}

/**
 * Tool execution outcome status.
 */
export enum ToolResultStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

/**
 * Domain event types published across event bus and transactional outbox.
 */
export enum DomainEventType {
  EXECUTION_CREATED = "EXECUTION_CREATED",
  EXECUTION_QUEUED = "EXECUTION_QUEUED",
  EXECUTION_STARTED = "EXECUTION_STARTED",
  STEP_STARTED = "STEP_STARTED",
  STEP_COMPLETED = "STEP_COMPLETED",
  TOOL_CALLED = "TOOL_CALLED",
  TOOL_COMPLETED = "TOOL_COMPLETED",
  APPROVAL_REQUESTED = "APPROVAL_REQUESTED",
  APPROVAL_RESOLVED = "APPROVAL_RESOLVED",
  EXECUTION_COMPLETED = "EXECUTION_COMPLETED",
  EXECUTION_FAILED = "EXECUTION_FAILED",
  EXECUTION_CANCELLED = "EXECUTION_CANCELLED",
}

/**
 * Category of delta payload contained in a realtime stream chunk.
 */
export enum StreamChunkType {
  TOKEN = "TOKEN",
  THOUGHT_DELTA = "THOUGHT_DELTA",
  TOOL_CALL_DELTA = "TOOL_CALL_DELTA",
  STEP_PROGRESS = "STEP_PROGRESS",
  RUNNER_HEARTBEAT = "RUNNER_HEARTBEAT",
}

export type { ErrorCode } from "./error-codes";

/**
 * Categorical tier of an agent memory item.
 * Dictates retention, lifecycle policy, and retrieval strategies.
 */
export enum MemoryType {
  /** Short-term conversational context thread */
  CONVERSATION = "CONVERSATION",
  /** Ephemeral scratchpad for intermediate execution state */
  WORKING = "WORKING",
  /** Explicit persistent user preferences, stylistic cues, and directives */
  USER_PREFERENCE = "USER_PREFERENCE",
  /** Verified factual assertions learned from user or tools */
  FACT = "FACT",
  /** Historical narrative log of past agent execution episodes */
  EPISODIC = "EPISODIC",
  /** Execution instructions, plans, and task templates */
  TASK = "TASK",
  /** System-level configuration or environmental knowledge */
  SYSTEM = "SYSTEM",
}
