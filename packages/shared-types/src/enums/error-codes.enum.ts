/**
 * @file packages/shared-types/src/enums/error-codes.enum.ts
 * @description Centralized error code registry for OrchestrAI. Provides both a runtime
 * const object (`ErrorCode`) and a derived TypeScript type so callers avoid hardcoded
 * string literals and benefit from IDE autocompletion + exhaustive switch checking.
 *
 * All string values strictly use lowercase snake_case strings.
 *
 * **Usage pattern (zero inline string literals)**:
 * ```ts
 * import { ErrorCode } from "@orchestrai/shared-types";
 * throw new OrchestrAIError("Something failed", ErrorCode.WORKER_ERROR, 500);
 * // ✅  ErrorCode.WORKER_ERROR instead of ❌  "worker_error"
 * ```
 *
 * @module @orchestrai/shared-types/enums
 */

/**
 * Authoritative runtime constant map of all machine-readable error codes used
 * across OrchestrAI apps and packages.
 *
 * - Using a `const` object (not a TypeScript `enum`) ensures values are plain strings
 *   that survive JSON serialization over API and log boundaries without transformation.
 * - The derived `ErrorCode` type union is used in generics and switch exhaustiveness checks.
 * - All string values use lowercase snake_case.
 *
 * **Add new entries here** whenever a new error category is introduced. Never hardcode
 * the string literal in call-sites; always reference `ErrorCode.KEY`.
 */
export const ErrorCode = {
  /** Default fallback for unhandled server-side failures */
  INTERNAL_SERVER_ERROR: "internal_server_error",

  /**
   * General internal error shorthand — alias used in some legacy middleware responses.
   * Prefer {@link ErrorCode.INTERNAL_SERVER_ERROR} for new code.
   */
  INTERNAL_ERROR: "internal_error",

  /** Input did not satisfy schema or invariant constraints */
  VALIDATION_ERROR: "validation_error",

  /** Malformed request body or query parameters */
  BAD_REQUEST: "bad_request",

  /** Requested resource (agent, execution, checkpoint) could not be located */
  NOT_FOUND: "not_found",

  /** Request carries no valid authentication credentials */
  UNAUTHORIZED: "unauthorized",

  /** Authenticated identity lacks sufficient permission for the operation */
  FORBIDDEN: "forbidden",

  /** Resource state conflict — e.g. duplicate key or concurrent modification */
  CONFLICT: "conflict",

  /** A registered tool encountered an unhandled failure or sandbox violation */
  TOOL_EXECUTION_FAILED: "tool_execution_failed",

  /** LLM provider request timed out or was throttled */
  MODEL_TIMEOUT: "model_timeout",

  /** Agent attempted an action blocked by safety or permission policy */
  POLICY_VIOLATION: "policy_violation",

  /** State machine checkpoint failed to persist or reload */
  CHECKPOINT_ERROR: "checkpoint_error",

  /** Human approval window expired without operator response */
  APPROVAL_TIMEOUT: "approval_timeout",

  /** Background queue failure or job dispatching error */
  QUEUE_ERROR: "queue_error",

  /** Queue is saturated and rejecting non-critical tasks */
  QUEUE_BACKPRESSURE: "queue_backpressure",

  /** Background worker task processing failure or lifecycle crash */
  WORKER_ERROR: "worker_error",

  /** Execution graph run encountered an unrecoverable failure or crashed state */
  EXECUTION_ERROR: "execution_error",

  /** Document ingestion, chunking, embedding, retrieval, or RAG pipeline failure */
  RAG_ERROR: "rag_error",

  /** Workspace exploration, file indexing, or file read failure */
  WORKSPACE_ERROR: "workspace_error",

  /** Workspace harness instruction, rules, or skill loader error */
  HARNESS_ERROR: "harness_error",

  /** Malformed JSON payload or parsing failure */
  PARSE_ERROR: "parse_error",

  /** Caller lacks permissions for the requested tenant or resource */
  PERMISSION_DENIED: "permission_denied",

  /** Request rate limit exceeded */
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",

  /** Execution costs exceeded financial or token budget guardrail */
  BUDGET_EXCEEDED: "budget_exceeded",

  /** Gateway or upstream service timed out */
  GATEWAY_TIMEOUT: "gateway_timeout",

  /** Invalid service or model configuration */
  CONFIGURATION_ERROR: "configuration_error",
} as const;

/**
 * Derived TypeScript type union of all valid error codes.
 * Used as the generic constraint in `OrchestrAIError<TCode extends ErrorCode>`.
 */
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
