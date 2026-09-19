/**
 * @file packages/core/src/errors/domain.errors.ts
 * @description Domain-specific error specializations for OrchestrAI.
 * Maps operational failure modes to distinct typed errors with sensible HTTP statuses.
 *
 * Each subclass passes a single ErrorCode literal to the base class generic,
 * so `err.code` is narrowed to that exact literal — enabling exhaustive
 * switch/match discrimination in handlers without string comparison.
 */

import { OrchestrAIError } from "./base.error";

/**
 * Thrown when runtime input validation or schema assertion fails.
 * Maps to HTTP 400 Bad Request.
 */
export class ValidationError extends OrchestrAIError<"VALIDATION_ERROR"> {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * Thrown when a requested resource (agent, execution, checkpoint) cannot be found.
 * Maps to HTTP 404 Not Found.
 */
export class NotFoundError extends OrchestrAIError<"NOT_FOUND"> {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found with identifier: '${identifier}'`, "NOT_FOUND", 404, {
      resource,
      identifier,
    });
  }
}

/**
 * Thrown when tool execution encounters an unhandled failure or sandbox violation.
 * Maps to HTTP 502 Bad Gateway (downstream tool failure).
 */
export class ToolExecutionError extends OrchestrAIError<"TOOL_EXECUTION_FAILED"> {
  constructor(toolName: string, causeMessage: string, details?: unknown) {
    super(
      `Tool '${toolName}' failed during execution: ${causeMessage}`,
      "TOOL_EXECUTION_FAILED",
      502,
      details,
    );
  }
}

/**
 * Thrown when an LLM provider request times out or is throttled.
 * Maps to HTTP 504 Gateway Timeout.
 */
export class ModelTimeoutError extends OrchestrAIError<"MODEL_TIMEOUT"> {
  constructor(modelName: string, timeoutMs: number) {
    super(`Model '${modelName}' request timed out after ${timeoutMs}ms`, "MODEL_TIMEOUT", 504, {
      modelName,
      timeoutMs,
    });
  }
}

/**
 * Thrown when an agent attempts an action that violates safety or permission policy.
 * Maps to HTTP 403 Forbidden.
 */
export class PolicyViolationError extends OrchestrAIError<"POLICY_VIOLATION"> {
  constructor(policyName: string, reason: string, details?: unknown) {
    super(
      `Execution rejected by policy '${policyName}': ${reason}`,
      "POLICY_VIOLATION",
      403,
      details,
    );
  }
}

/**
 * Thrown when a state machine checkpoint fails to persist or reload.
 * Maps to HTTP 500 Internal Server Error.
 */
export class CheckpointError extends OrchestrAIError<"CHECKPOINT_ERROR"> {
  constructor(executionId: string, action: "read" | "write", reason: string) {
    super(
      `Checkpoint ${action} failed for execution '${executionId}': ${reason}`,
      "CHECKPOINT_ERROR",
      500,
      { executionId, action, reason },
    );
  }
}

/**
 * Thrown when a human approval window expires without operator response.
 * Maps to HTTP 408 Request Timeout.
 */
export class ApprovalTimeoutError extends OrchestrAIError<"APPROVAL_TIMEOUT"> {
  constructor(approvalId: string, timeoutMs: number) {
    super(
      `Human approval '${approvalId}' timed out after ${timeoutMs}ms`,
      "APPROVAL_TIMEOUT",
      408,
      { approvalId, timeoutMs },
    );
  }
}

/**
 * Thrown when a queue operations failure occurs (e.g. BullMQ or Redis dispatching error).
 * Maps to HTTP 500 Internal Server Error.
 */
export class QueueError extends OrchestrAIError<"QUEUE_ERROR"> {
  constructor(message: string, details?: unknown) {
    super(message, "QUEUE_ERROR", 500, details);
  }
}

/**
 * Thrown when an incoming task is rejected because the target queue backlog is saturated.
 * Maps to HTTP 503 Service Unavailable (backpressure rejection).
 */
export class QueueBackpressureError extends OrchestrAIError<"QUEUE_BACKPRESSURE"> {
  constructor(queueName: string, backlogCount: number, highWatermark: number) {
    super(
      `Queue '${queueName}' rejected task: backlog (${backlogCount}) exceeded high watermark (${highWatermark})`,
      "QUEUE_BACKPRESSURE",
      503,
      { queueName, backlogCount, highWatermark },
    );
  }
}

/**
 * Thrown when a background worker encounters an unrecoverable failure during job execution
 * or worker lifecycle transition.
 * Maps to HTTP 500 Internal Server Error.
 */
export class WorkerError extends OrchestrAIError<"WORKER_ERROR"> {
  constructor(message: string, details?: unknown) {
    super(message, "WORKER_ERROR", 500, details);
  }
}
