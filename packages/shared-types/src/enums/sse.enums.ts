/**
 * @file packages/shared-types/src/enums/sse.enums.ts
 * @description Enumerations for Server-Sent Events (SSE) wire protocol roles, step statuses,
 * and outcomes, as well as WebSocket client/server message discriminators and action types.
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

/**
 * Discriminator types for incoming client-to-server WebSocket message frames.
 * Replaces the inline string literals in `ws-protocol.types.ts` so message
 * type comparisons always use `WsClientMessageType.AUTH` etc.
 */
export enum WsClientMessageType {
  /** Initial authentication handshake frame carrying a Bearer token */
  AUTH = "auth",
  /** Subscribe to one or more execution / tenant event channel topics */
  SUBSCRIBE = "subscribe",
  /** Unsubscribe from previously subscribed topics */
  UNSUBSCRIBE = "unsubscribe",
  /** Periodic heartbeat frame to keep the connection alive */
  PING = "ping",
  /** Operator-initiated control action on an active execution */
  ACTION = "action",
}

/**
 * Discriminator types for outgoing server-to-client WebSocket message frames.
 */
export enum WsServerMessageType {
  /** Acknowledgement that the connection and authentication were accepted */
  CONNECTED = "connected",
  /** Acknowledgement that a topic subscription was registered */
  SUBSCRIBED = "subscribed",
  /** Acknowledgement that a topic subscription was removed */
  UNSUBSCRIBED = "unsubscribed",
  /** Delivery of a domain event payload to the subscribed client */
  EVENT = "event",
  /** Presence / connection state change notification */
  PRESENCE = "presence",
  /** Heartbeat response to a client PING frame */
  PONG = "pong",
  /** Server-originated error notification */
  ERROR = "error",
}

/**
 * Operator control actions transmitted in a {@link WsClientMessageType.ACTION} frame.
 * These drive real-time control-plane transitions over WebSocket — e.g. approving a
 * Human-in-the-Loop gate or cancelling a running execution.
 *
 * Never use the raw string literals; always reference `WsClientAction.RESOLVE_APPROVAL` etc.
 */
export enum WsClientAction {
  /** Approve a pending Human-in-the-Loop gate and resume the execution */
  RESOLVE_APPROVAL = "resolve_approval",
  /** Immediately abort an in-progress execution run */
  CANCEL_EXECUTION = "cancel_execution",
  /** Re-enqueue a failed execution step for retry */
  RETRY_STEP = "retry_step",
}

/**
 * Presence event types broadcast when an operator joins or leaves an execution room.
 */
export enum PresenceEvent {
  JOIN = "join",
  LEAVE = "leave",
}

/**
 * Transport protocols supported by the realtime streaming gateway.
 */
export enum RealtimeTransport {
  WEBSOCKET = "websocket",
  SSE = "sse",
}
