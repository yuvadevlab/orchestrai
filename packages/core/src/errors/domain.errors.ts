/**
 * @file packages/core/src/errors/domain.errors.ts
 * @description Domain-specific error specializations for OrchestrAI.
 * Maps operational failure modes to distinct typed errors with sensible HTTP statuses.
 */

import { OrchestrAIError } from "./base.error";

/**
 * Thrown when runtime input validation or schema assertion fails.
 */
export class ValidationError extends OrchestrAIError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * Thrown when a requested resource (agent, execution, checkpoint) cannot be found.
 */
export class NotFoundError extends OrchestrAIError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found with identifier: '${identifier}'`, "NOT_FOUND", 404, {
      resource,
      identifier,
    });
  }
}

/**
 * Thrown when tool execution encounters an unhandled failure or sandbox violation.
 */
export class ToolExecutionError extends OrchestrAIError {
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
 */
export class ModelTimeoutError extends OrchestrAIError {
  constructor(modelName: string, timeoutMs: number) {
    super(`Model '${modelName}' request timed out after ${timeoutMs}ms`, "MODEL_TIMEOUT", 504, {
      modelName,
      timeoutMs,
    });
  }
}

/**
 * Thrown when an agent attempts an action that violates safety or permission policy.
 */
export class PolicyViolationError extends OrchestrAIError {
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
 */
export class CheckpointError extends OrchestrAIError {
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
 */
export class ApprovalTimeoutError extends OrchestrAIError {
  constructor(approvalId: string, timeoutMs: number) {
    super(
      `Human approval '${approvalId}' timed out after ${timeoutMs}ms`,
      "APPROVAL_TIMEOUT",
      408,
      { approvalId, timeoutMs },
    );
  }
}
