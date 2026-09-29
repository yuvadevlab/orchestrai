/**
 * @file packages/shared-types/src/enums/sse.enums.ts
 * @description Enumerations for Server-Sent Events (SSE) wire protocol roles, step statuses, and outcomes.
 * @module @orchestrai/shared-types/enums
 */

/**
 * Author roles supported in SSE message event streaming.
 */
export enum SseMessageRole {
  ASSISTANT = "assistant",
  AGENT = "agent",
  SYSTEM = "system",
  USER = "user",
}

/**
 * Tool execution status reported in intermediate SSE tool call events.
 */
export enum SseToolCallStatus {
  STARTED = "started",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Terminal completion status reported in SSE done events.
 */
export enum SseDoneStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}
