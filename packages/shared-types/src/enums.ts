/**
 * @file packages/shared-types/src/enums.ts
 * @description Master catalog of domain enumerations used across apps and packages.
 */

/**
 * Operating mode governing agent autonomy, planning, and execution strategy.
 */
export enum AgentMode {
  /** Conversational focus with minimal, passive tool invocation */
  CHAT = "CHAT",
  /** Deconstructs goals into execution DAGs before tool invocation */
  PLAN = "PLAN",
  /** Autonomous tool execution loop with active safety limits */
  ACT = "ACT",
  /** Adaptive orchestrator that plans, executes, and verifies */
  AUTO = "AUTO",
}

/**
 * Lifecycle state machine status of an execution run.
 */
export enum ExecutionStatus {
  /** Execution record created but not yet scheduled */
  CREATED = "CREATED",
  /** Execution job enqueued in the background queue */
  QUEUED = "QUEUED",
  /** Actively processing steps on a worker */
  RUNNING = "RUNNING",
  /** Suspended waiting for human operator approval */
  WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL",
  /** Terminal state: all steps completed successfully */
  COMPLETED = "COMPLETED",
  /** Terminal state: unrecoverable execution failure */
  FAILED = "FAILED",
  /** Terminal state: explicitly aborted by client or operator */
  CANCELLED = "CANCELLED",
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
  PENDING = "PENDING",
  /** Cleared by operator to proceed */
  APPROVED = "APPROVED",
  /** Rejected by operator */
  REJECTED = "REJECTED",
  /** Timed out without operator interaction */
  TIMED_OUT = "TIMED_OUT",
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
  READ_ONLY = "READ_ONLY",
  /** Reversible or sandboxed local modifications */
  WRITE_SAFE = "WRITE_SAFE",
  /** External network or non-destructive API updates */
  SENSITIVE = "SENSITIVE",
  /** Destructive actions; unconditionally requires human approval */
  DANGEROUS = "DANGEROUS",
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

/**
 * Exhaustive union of all machine-readable error codes used across OrchestrAI.
 *
 * Defined as a string-literal union (not an enum) so that:
 * - Values survive serialization as plain strings over API and log boundaries
 * - `switch (err.code)` handlers can be exhaustiveness-checked by TypeScript
 * - Domain error subclasses narrow the base class generic to a single literal
 *
 * Add new codes here whenever a new domain error subclass is introduced.
 */
export type ErrorCode =
  /** Default fallback for unhandled server-side failures */
  | "INTERNAL_SERVER_ERROR"
  /** Input did not satisfy schema or invariant constraints */
  | "VALIDATION_ERROR"
  /** Requested resource (agent, execution, checkpoint) could not be located */
  | "NOT_FOUND"
  /** A registered tool encountered an unhandled failure or sandbox violation */
  | "TOOL_EXECUTION_FAILED"
  /** LLM provider request timed out or was throttled */
  | "MODEL_TIMEOUT"
  /** Agent attempted an action blocked by safety or permission policy */
  | "POLICY_VIOLATION"
  /** State machine checkpoint failed to persist or reload */
  | "CHECKPOINT_ERROR"
  /** Human approval window expired without operator response */
  | "APPROVAL_TIMEOUT"
  /** Background queue failure or job dispatching error */
  | "QUEUE_ERROR"
  /** Queue is saturated and rejecting non-critical tasks */
  | "QUEUE_BACKPRESSURE"
  /** Background worker task processing failure or lifecycle crash */
  | "WORKER_ERROR"
  /** Execution graph run encountered an unrecoverable failure or crashed state */
  | "EXECUTION_ERROR";
