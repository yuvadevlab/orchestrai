/**
 * @file packages/core/src/errors/domain.errors.ts
 * @description Domain-specific error specializations for OrchestrAI.
 * Maps operational failure modes to distinct typed errors with sensible HTTP statuses.
 *
 * Each subclass passes a single `ErrorCode` value to the base class generic via
 * `ErrorCode.X` (never a raw string literal), so `err.code` is narrowed to that
 * exact literal — enabling exhaustive switch/match discrimination in handlers.
 */

import { ErrorCode } from "@orchestrai/shared-types";
import { OrchestrAIError } from "./base.error";

/**
 * Thrown when runtime input validation or schema assertion fails.
 * Maps to HTTP 400 Bad Request.
 */
export class ValidationError extends OrchestrAIError<typeof ErrorCode.VALIDATION_ERROR> {
  constructor(message: string, details?: unknown) {
    // Use ErrorCode.VALIDATION_ERROR instead of the raw string literal
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

/**
 * Thrown when a requested resource (agent, execution, checkpoint) cannot be found.
 * Maps to HTTP 404 Not Found.
 */
export class NotFoundError extends OrchestrAIError<typeof ErrorCode.NOT_FOUND> {
  constructor(resource: string, identifier: string) {
    // Surface the resource name and identifier for structured log inspection
    super(`${resource} not found with identifier: '${identifier}'`, ErrorCode.NOT_FOUND, 404, {
      resource,
      identifier,
    });
  }
}

/**
 * Thrown when tool execution encounters an unhandled failure or sandbox violation.
 * Maps to HTTP 502 Bad Gateway (downstream tool failure).
 */
export class ToolExecutionError extends OrchestrAIError<typeof ErrorCode.TOOL_EXECUTION_FAILED> {
  constructor(toolName: string, causeMessage: string, details?: unknown) {
    super(
      `Tool '${toolName}' failed during execution: ${causeMessage}`,
      ErrorCode.TOOL_EXECUTION_FAILED,
      502,
      details,
    );
  }
}

/**
 * Thrown when an LLM provider request times out or is throttled.
 * Maps to HTTP 504 Gateway Timeout.
 */
export class ModelTimeoutError extends OrchestrAIError<typeof ErrorCode.MODEL_TIMEOUT> {
  constructor(modelName: string, timeoutMs: number) {
    super(
      `Model '${modelName}' request timed out after ${timeoutMs}ms`,
      ErrorCode.MODEL_TIMEOUT,
      504,
      {
        modelName,
        timeoutMs,
      },
    );
  }
}

/**
 * Thrown when an agent attempts an action that violates safety or permission policy.
 * Maps to HTTP 403 Forbidden.
 */
export class PolicyViolationError extends OrchestrAIError<typeof ErrorCode.POLICY_VIOLATION> {
  constructor(policyName: string, reason: string, details?: unknown) {
    super(
      `Execution rejected by policy '${policyName}': ${reason}`,
      ErrorCode.POLICY_VIOLATION,
      403,
      details,
    );
  }
}

/**
 * Thrown when a state machine checkpoint fails to persist or reload.
 * Maps to HTTP 500 Internal Server Error.
 */
export class CheckpointError extends OrchestrAIError<typeof ErrorCode.CHECKPOINT_ERROR> {
  constructor(executionId: string, action: "read" | "write", reason: string) {
    super(
      `Checkpoint ${action} failed for execution '${executionId}': ${reason}`,
      ErrorCode.CHECKPOINT_ERROR,
      500,
      { executionId, action, reason },
    );
  }
}

/**
 * Thrown when a human approval window expires without operator response.
 * Maps to HTTP 408 Request Timeout.
 */
export class ApprovalTimeoutError extends OrchestrAIError<typeof ErrorCode.APPROVAL_TIMEOUT> {
  constructor(approvalId: string, timeoutMs: number) {
    super(
      `Human approval '${approvalId}' timed out after ${timeoutMs}ms`,
      ErrorCode.APPROVAL_TIMEOUT,
      408,
      { approvalId, timeoutMs },
    );
  }
}

/**
 * Thrown when a queue operations failure occurs (e.g. BullMQ or Redis dispatching error).
 * Maps to HTTP 500 Internal Server Error.
 */
export class QueueError extends OrchestrAIError<typeof ErrorCode.QUEUE_ERROR> {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.QUEUE_ERROR, 500, details);
  }
}

/**
 * Thrown when an incoming task is rejected because the target queue backlog is saturated.
 * Maps to HTTP 503 Service Unavailable (backpressure rejection).
 */
export class QueueBackpressureError extends OrchestrAIError<typeof ErrorCode.QUEUE_BACKPRESSURE> {
  constructor(queueName: string, backlogCount: number, highWatermark: number) {
    super(
      `Queue '${queueName}' rejected task: backlog (${backlogCount}) exceeded high watermark (${highWatermark})`,
      ErrorCode.QUEUE_BACKPRESSURE,
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
export class WorkerError extends OrchestrAIError<typeof ErrorCode.WORKER_ERROR> {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.WORKER_ERROR, 500, details);
  }
}

/**
 * Thrown when an execution graph encountered an unrecoverable crash or invalid state.
 * Maps to HTTP 500 Internal Server Error.
 */
export class ExecutionError extends OrchestrAIError<typeof ErrorCode.EXECUTION_ERROR> {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.EXECUTION_ERROR, 500, details);
  }
}

/**
 * Thrown when document ingestion, chunking, embedding, vector retrieval, or RAG pipeline fails.
 * Maps to HTTP 500 Internal Server Error.
 */
export class RagError extends OrchestrAIError<typeof ErrorCode.RAG_ERROR> {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.RAG_ERROR, 500, details);
  }
}

/**
 * Thrown when service, agent, or model configuration is missing or invalid.
 * Maps to HTTP 500 Internal Server Error.
 */
export class ConfigurationError extends OrchestrAIError<typeof ErrorCode.CONFIGURATION_ERROR> {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.CONFIGURATION_ERROR, 500, details);
  }
}
