/**
 * @file apps/realtime/src/sse/sse-handler.ts
 * @description HTTP request handler for Server-Sent Events execution and event stream endpoints.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { defaultLogger } from "@orchestrai/logger";
import { ClientSession, ConnectionRegistry } from "@/connection";
import { SubscriptionManager } from "@/subscriptions";
import { ChannelTopics } from "@/contracts";
import { configureSseHeaders, sendSseEvent, sendSseKeepalive, closeSseStream } from "./sse-channel";

interface SseHandlerDeps {
  readonly registry: ConnectionRegistry;
  readonly subscriptions: SubscriptionManager;
  readonly corsOrigins: readonly string[];
  readonly heartbeatIntervalMs: number;
}

/**
 * Resolves the permitted CORS origin for an SSE response based on request headers.
 */
function resolveCorsOrigin(req: IncomingMessage, allowed: readonly string[]): string {
  const requestOrigin = req.headers.origin ?? "";
  // Allow if explicitly listed, otherwise default to first configured origin
  return allowed.includes(requestOrigin) ? requestOrigin : (allowed[0] ?? "*");
}

/**
 * Handles SSE connections for a specific execution run.
 * Route: GET /api/v1/executions/:id/stream
 */
export function handleExecutionSseStream(
  req: IncomingMessage,
  res: ServerResponse,
  executionId: string,
  deps: SseHandlerDeps,
): void {
  const sessionId = crypto.randomUUID();
  const corsOrigin = resolveCorsOrigin(req, deps.corsOrigins);

  // Establish SSE response headers before writing any data frames
  configureSseHeaders(res, corsOrigin);

  // Build ClientSession wrapping the SSE response lifecycle
  const session = new ClientSession({
    id: sessionId,
    transport: "SSE",
    ipAddress: req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
    sendFn: (data) => {
      if (!res.writableEnded) {
        res.write(data);
      }
    },
    closeFn: () => {
      if (!res.writableEnded) {
        res.end();
      }
    },
  });

  try {
    deps.registry.register(session);
  } catch {
    // Guard: If capacity exceeded, send 503 and refuse connection
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server connection limit reached" }));
    return;
  }

  // Subscribe session to the execution-specific channel
  const topic = ChannelTopics.execution(executionId);
  deps.subscriptions.subscribe(sessionId, topic);
  session.subscribe(topic);

  // Send initial connected event confirming stream is open
  sendSseEvent(res, "connected", { sessionId, executionId, timestamp: Date.now() });

  // Setup heartbeat keepalive interval to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    sendSseKeepalive(res);
  }, deps.heartbeatIntervalMs);

  // Cleanup handler on client disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    deps.subscriptions.unsubscribeAll(sessionId);
    deps.registry.unregister(sessionId);
    closeSseStream(res, "Client disconnected");
    defaultLogger.debug("SSE client disconnected", { sessionId, executionId });
  });

  defaultLogger.info("SSE stream established", { sessionId, executionId });
}

/**
 * Handles SSE connections for the global system event stream.
 * Route: GET /api/v1/events/stream
 */
export function handleGlobalSseStream(
  req: IncomingMessage,
  res: ServerResponse,
  deps: SseHandlerDeps,
): void {
  const sessionId = crypto.randomUUID();
  const corsOrigin = resolveCorsOrigin(req, deps.corsOrigins);

  configureSseHeaders(res, corsOrigin);

  const session = new ClientSession({
    id: sessionId,
    transport: "SSE",
    ipAddress: req.socket.remoteAddress,
    sendFn: (data) => {
      if (!res.writableEnded) {
        res.write(data);
      }
    },
    closeFn: () => {
      if (!res.writableEnded) {
        res.end();
      }
    },
  });

  try {
    deps.registry.register(session);
  } catch {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server connection limit reached" }));
    return;
  }

  const broadcastTopic = ChannelTopics.systemBroadcast();
  deps.subscriptions.subscribe(sessionId, broadcastTopic);

  sendSseEvent(res, "connected", { sessionId, timestamp: Date.now() });

  const heartbeat = setInterval(() => {
    sendSseKeepalive(res);
  }, deps.heartbeatIntervalMs);

  req.on("close", () => {
    clearInterval(heartbeat);
    deps.subscriptions.unsubscribeAll(sessionId);
    deps.registry.unregister(sessionId);
    defaultLogger.debug("Global SSE client disconnected", { sessionId });
  });
}
