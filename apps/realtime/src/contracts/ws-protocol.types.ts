/**
 * @file apps/realtime/src/contracts/ws-protocol.types.ts
 * @description Strongly-typed schemas and TypeScript types for WebSocket client/server messaging protocol.
 * All message type discriminators and action identifiers reference shared enums from
 * `@orchestrai/shared-types` — never inline string literals.
 */

import { z } from "zod";
import { WsClientMessageType, WsServerMessageType, WsClientAction } from "@orchestrai/shared-types";

/**
 * Re-export WsClientMessageType and WsServerMessageType for downstream consumers
 * that import from this module's contract boundary.
 */
export {
  WsClientMessageType,
  WsServerMessageType,
  WsClientAction,
  WsServerMessageType as ServerMessageType,
  WsClientMessageType as ClientMessageType,
};

/** Schema for client authentication frame */
export const ClientAuthMessageSchema = z.object({
  type: z.literal(WsClientMessageType.AUTH),
  token: z.string().min(1),
  tenantId: z.string().optional(),
});

/** Schema for subscribing to one or more channel topics */
export const ClientSubscribeMessageSchema = z.object({
  type: z.literal(WsClientMessageType.SUBSCRIBE),
  topics: z.array(z.string().min(1)).min(1),
});

/** Schema for unsubscribing from channel topics */
export const ClientUnsubscribeMessageSchema = z.object({
  type: z.literal(WsClientMessageType.UNSUBSCRIBE),
  topics: z.array(z.string().min(1)).min(1),
});

/** Schema for client ping heartbeat frame */
export const ClientPingMessageSchema = z.object({
  type: z.literal(WsClientMessageType.PING),
  timestamp: z.number().int().positive().optional(),
});

/**
 * Schema for interactive operator actions over WebSocket.
 * The `action` field is constrained to {@link WsClientAction} values via `z.enum`
 * so any new action only needs a single enum entry change.
 */
export const ClientActionMessageSchema = z.object({
  type: z.literal(WsClientMessageType.ACTION),
  /** Operator control action — see {@link WsClientAction} for all supported values */
  action: z.enum(WsClientAction),
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
  readonly type: WsServerMessageType;
  readonly timestamp: number;
  readonly payload?: TPayload;
}
