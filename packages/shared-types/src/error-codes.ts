/**
 * @file packages/shared-types/src/error-codes.ts
 * @description Machine-readable error code catalog used across OrchestrAI packages.
 */

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
  | "EXECUTION_ERROR"
  /** Document ingestion, chunking, embedding, retrieval, or RAG pipeline failure */
  | "RAG_ERROR";
