/**
 * @file apps/realtime/src/server/http-router.ts
 * @description Minimal HTTP router dispatching CORS, health, metrics, and SSE route handlers.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { handleExecutionSseStream, handleGlobalSseStream } from "../sse/sse-handler";
import type { ConnectionRegistry } from "../connection/connection-registry";
import type { SubscriptionManager } from "../subscriptions/subscription-manager";

interface RouterDeps {
  readonly registry: ConnectionRegistry;
  readonly subscriptions: SubscriptionManager;
  readonly corsOrigins: readonly string[];
  readonly heartbeatIntervalMs: number;
}

/**
 * Handles CORS preflight (OPTIONS) requests with the allowed method headers.
 */
function handleOptions(res: ServerResponse, corsOrigin: string): void {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  });
  res.end();
}

/**
 * Returns JSON health status indicating service availability and connection stats.
 */
function handleHealth(res: ServerResponse, registry: ConnectionRegistry): void {
  const stats = registry.getStats();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "ok",
      service: "orchestrai-realtime",
      timestamp: new Date().toISOString(),
      connections: stats,
    }),
  );
}

/**
 * Returns JSON metrics snapshot for monitoring and alerting integrations.
 */
function handleMetrics(
  res: ServerResponse,
  registry: ConnectionRegistry,
  subscriptions: SubscriptionManager,
): void {
  const stats = registry.getStats();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      connections_total: stats.total,
      connections_websocket: stats.websocketCount,
      connections_sse: stats.sseCount,
      connections_authenticated: stats.authenticatedCount,
      topics_total: subscriptions.topicCount,
    }),
  );
}

/**
 * Returns 404 JSON for unmatched routes.
 */
function handleNotFound(res: ServerResponse): void {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
}

/**
 * Master HTTP request dispatcher routing to appropriate handlers by method and path.
 */
export function createHttpRouter(deps: RouterDeps) {
  return function dispatch(req: IncomingMessage, res: ServerResponse): void {
    const { url = "/", method = "GET" } = req;
    const origin = req.headers.origin ?? "*";
    const corsOrigin = deps.corsOrigins.includes(origin) ? origin : (deps.corsOrigins[0] ?? "*");
    const pathname = url.split("?")[0] ?? "/";

    // Handle preflight immediately to unblock browser cross-origin requests
    if (method === "OPTIONS") {
      handleOptions(res, corsOrigin);
      return;
    }

    if (method !== "GET") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    if (pathname === "/health") {
      handleHealth(res, deps.registry);
      return;
    }

    if (pathname === "/metrics") {
      handleMetrics(res, deps.registry, deps.subscriptions);
      return;
    }

    if (pathname === "/api/v1/events/stream") {
      handleGlobalSseStream(req, res, deps);
      return;
    }

    // Match /api/v1/executions/:id/stream
    const execStreamMatch = pathname.match(/^\/api\/v1\/executions\/([^/]+)\/stream$/);
    if (execStreamMatch) {
      const executionId = execStreamMatch[1] ?? "";
      handleExecutionSseStream(req, res, executionId, deps);
      return;
    }

    handleNotFound(res);
  };
}
