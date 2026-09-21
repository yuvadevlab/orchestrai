/**
 * @file apps/realtime/src/websocket/ws-message-handler.ts
 * @description Validates and dispatches incoming WebSocket frames to subscription, auth, and action handlers.
 */

import { defaultLogger } from "@orchestrai/logger";
import { ChannelTopics, ClientMessageSchema, ServerMessageType } from "@/contracts";
import type { ClientSession, ConnectionRegistry } from "@/connection";
import type { SubscriptionManager } from "@/subscriptions";
import { authenticateSession } from "./ws-authenticator";

interface MessageHandlerDeps {
  readonly registry: ConnectionRegistry;
  readonly subscriptions: SubscriptionManager;
  readonly jwtSecret: string;
}

/**
 * Builds and serializes a server-to-client frame payload.
 */
function buildServerFrame(type: ServerMessageType, payload?: unknown): string {
  return JSON.stringify({ type, timestamp: Date.now(), payload });
}

/**
 * Processes a raw incoming WebSocket message buffer from a client session.
 *
 * @param session - Source ClientSession sending the message
 * @param rawData - Raw message data buffer
 * @param deps - Injected handler dependencies
 */
export function handleWsMessage(
  session: ClientSession,
  rawData: Buffer | string,
  deps: MessageHandlerDeps,
): void {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawData.toString());
  } catch {
    // Guard: Malformed JSON should send a descriptive error frame and stop processing
    session.send(
      buildServerFrame(ServerMessageType.ERROR, { code: "PARSE_ERROR", message: "Invalid JSON" }),
    );
    return;
  }

  const result = ClientMessageSchema.safeParse(parsed);
  if (!result.success) {
    // Guard: Schema validation ensures clients cannot submit unexpected frame shapes
    session.send(
      buildServerFrame(ServerMessageType.ERROR, {
        code: "VALIDATION_ERROR",
        message: "Invalid message format",
        details: result.error.issues,
      }),
    );
    return;
  }

  const msg = result.data;
  session.touch();

  switch (msg.type) {
    case "AUTH": {
      const authResult = authenticateSession(session.id, msg.token, deps.jwtSecret, deps.registry);
      if (authResult.authenticated) {
        session.send(buildServerFrame(ServerMessageType.CONNECTED, { userId: authResult.userId }));
      } else {
        session.send(
          buildServerFrame(ServerMessageType.ERROR, {
            code: "AUTH_FAILED",
            message: authResult.reason,
          }),
        );
      }
      break;
    }

    case "SUBSCRIBE": {
      for (const topic of msg.topics) {
        if (!ChannelTopics.isValid(topic)) {
          // Skip invalid topics to prevent arbitrary channel floods
          continue;
        }
        deps.subscriptions.subscribe(session.id, topic);
        session.subscribe(topic);
      }
      session.send(buildServerFrame(ServerMessageType.SUBSCRIBED, { topics: msg.topics }));
      break;
    }

    case "UNSUBSCRIBE": {
      for (const topic of msg.topics) {
        deps.subscriptions.unsubscribe(session.id, topic);
        session.unsubscribe(topic);
      }
      session.send(buildServerFrame(ServerMessageType.UNSUBSCRIBED, { topics: msg.topics }));
      break;
    }

    case "PING": {
      session.send(buildServerFrame(ServerMessageType.PONG, { timestamp: Date.now() }));
      break;
    }

    case "ACTION": {
      // Phase 12: Log action; actual approval/cancel routing handled by Gateway HTTP API
      defaultLogger.info("WebSocket ACTION received", {
        sessionId: session.id,
        action: msg.action,
        executionId: msg.executionId,
      });
      break;
    }

    default: {
      session.send(
        buildServerFrame(ServerMessageType.ERROR, {
          code: "UNKNOWN_TYPE",
          message: "Unrecognized message type",
        }),
      );
    }
  }
}
