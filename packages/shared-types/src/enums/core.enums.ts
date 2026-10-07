/**
 * @file packages/shared-types/src/enums/core.enums.ts
 * @description Core lifecycle, agent execution, and runtime state enumerations.
 */

/**
 * Canonical HTTP method verbs.
 */
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
}

/**
 * Operating mode governing agent autonomy, planning, and execution strategy.
 */
export enum AgentMode {
  CHAT = "chat",
  PLAN = "plan",
  ACT = "act",
  AUTO = "auto",
}

/**
 * Lifecycle state machine status of an execution run.
 */
export enum ExecutionStatus {
  QUEUED = "pending",
  RUNNING = "running",
  WAITING_FOR_APPROVAL = "suspended",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Functional category of a single step within an execution run.
 */
export enum StepType {
  MODEL_CALL = "MODEL_CALL",
  TOOL_EXECUTION = "TOOL_EXECUTION",
  STATE_TRANSITION = "STATE_TRANSITION",
  APPROVAL = "APPROVAL",
}

/**
 * Lifecycle processing status of an individual execution step.
 */
export enum StepStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}

/**
 * High-level outcome of executing an autonomous agent loop step.
 */
export enum StepOutcome {
  CONTINUE = "CONTINUE",
  WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL",
  HALTED = "HALTED",
  ERROR = "ERROR",
}

/**
 * Human-in-the-loop (HITL) approval status.
 */
export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
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
  READ_ONLY = "read_only",
  WRITE_SAFE = "write_safe",
  SENSITIVE = "sensitive",
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
