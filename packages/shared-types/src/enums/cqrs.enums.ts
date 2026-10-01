/**
 * @file packages/shared-types/src/enums/cqrs.enums.ts
 * @description Enumerations for CQRS command types, routing keys, and queue backoff policies.
 * @module @orchestrai/shared-types/enums
 */

/**
 * Command discriminators for execution lifecycle mutations.
 */
export enum ExecutionCommandType {
  CREATE = "execution.create",
  CANCEL = "execution.cancel",
  RESUME = "execution.resume",
}

/**
 * Command discriminators for human-in-the-loop approval actions.
 */
export enum ApprovalCommandType {
  RESOLVE = "approval.resolve",
  EXPIRE = "approval.expire",
}

/**
 * Command discriminators for conversation session mutations.
 */
export enum SessionCommandType {
  CREATE = "session.create",
  UPDATE = "session.update",
  DELETE = "session.delete",
  APPEND_MESSAGE = "session.append_message",
}

/**
 * Backoff strategy types for queue job retry schedules.
 */
export enum QueueBackoffType {
  FIXED = "fixed",
  EXPONENTIAL = "exponential",
}
