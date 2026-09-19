/**
 * @file apps/realtime/src/contracts/ws-protocol.types.ts
 * @description Strongly-typed schemas and TypeScript types for WebSocket client/server messaging protocol.
 */

import { z } from "zod";

/**
 * Discriminator types for incoming client-to-server WebSocket messages.
 */
export const ClientMessageType = {
  AUTH: "AUTH",
  SUBSCRIBE: "SUBSCRIBE",
  UNSUBSCRIBE: "UNSUBSCRIBE",
  PING: "PING",
  ACTION: "ACTION",
} as const;

export type ClientMessageType = (typeof ClientMessageType)[keyof typeof ClientMessageType];

/**
 * Discriminator types for outgoing server-to-client WebSocket messages.
 */
export const ServerMessageType = {
  CONNECTED: "CONNECTED",
  SUBSCRIBED: "SUBSCRIBED",
  UNSUBSCRIBED: "UNSUBSCRIBED",
  EVENT: "EVENT",
  PRESENCE: "PRESENCE",
  PONG: "PONG",
  ERROR: "ERROR",
} as const;

export type ServerMessageType = (typeof ServerMessageType)[keyof typeof ServerMessageType];

/** Schema for client authentication frame */
export const ClientAuthMessageSchema = z.object({
  type: z.literal(ClientMessageType.AUTH),
  token: z.string().min(1),
  tenantId: z.string().optional(),
});

/** Schema for subscribing to one or more channel topics */
export const ClientSubscribeMessageSchema = z.object({
  type: z.literal(ClientMessageType.SUBSCRIBE),
  topics: z.array(z.string().min(1)).min(1),
});

/** Schema for unsubscribing from channel topics */
export const ClientUnsubscribeMessageSchema = z.object({
  type: z.literal(ClientMessageType.UNSUBSCRIBE),
  topics: z.array(z.string().min(1)).min(1),
});

/** Schema for client ping heartbeat frame */
export const ClientPingMessageSchema = z.object({
  type: z.literal(ClientMessageType.PING),
  timestamp: z.number().int().positive().optional(),
});

/** Schema for interactive operator actions over WebSocket */
export const ClientActionMessageSchema = z.object({
  type: z.literal(ClientMessageType.ACTION),
  action: z.enum(["RESOLVE_APPROVAL", "CANCEL_EXECUTION", "RETRY_STEP"]),
  executionId: z.string().min(1),
  approvalId: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

/** Master union of all valid client-to-server frames */
export const ClientMessageSchema = z.discriminatedUnion("type", [
  ClientAuthMessageSchema,
  ClientSubscribeMessageSchema,
  ClientUnsubscribeMessageSchema,
  ClientPingMessageSchema,
  ClientActionMessageSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;

/** Outgoing server message envelope shapes */
export interface ServerMessage<TPayload = unknown> {
  readonly type: ServerMessageType;
  readonly timestamp: number;
  readonly payload?: TPayload;
}
