/**
 * @file apps/realtime/src/server/http-router.ts
 * @description Minimal HTTP router dispatching CORS, health, metrics, and SSE route handlers.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { Logger, loggerWithConfig, requestLogger } from "@yuva-devlab/logger";
import { handleExecutionSseStream, handleGlobalSseStream } from "@/sse";
import type { ConnectionRegistry } from "@/connection";
import type { SubscriptionManager } from "@/subscriptions";

interface RouterDeps {
  readonly registry: ConnectionRegistry;
  readonly subscriptions: SubscriptionManager;
  readonly corsOrigins: readonly string[];
  readonly heartbeatIntervalMs: number;
}

/**
/**
 * Handles CORS preflight (OPTIONS) requests with the allowed method headers.
 */
function handleOptions(req: IncomingMessage, res: ServerResponse, corsOrigin: string): void {
  const requestedHeaders = req.headers["access-control-request-headers"];
  res.writeHead(204, {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      requestedHeaders ||
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Tenant-ID, x-tenant-id, X-Request-ID, Idempotency-Key, Last-Event-ID, Cache-Control",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
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
  const logger = loggerWithConfig(new Logger("RealtimeRouter"));
  const reqLogger = requestLogger(logger);

  return function dispatch(req: IncomingMessage, res: ServerResponse): void {
    if (process.env.LOG_REQUESTS !== "false") {
      reqLogger(req, res, () => {});
    }

    const { url = "/", method = "GET" } = req;
    const requestOrigin = req.headers.origin;
    let corsOrigin = "*";
    if (requestOrigin) {
      if (
        deps.corsOrigins.includes(requestOrigin) ||
        deps.corsOrigins.includes("*") ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      ) {
        corsOrigin = requestOrigin;
      } else {
        corsOrigin = deps.corsOrigins[0] ?? "*";
      }
    }

    const pathname = url.split("?")[0] ?? "/";

    // Handle preflight immediately to unblock browser cross-origin requests
    if (method === "OPTIONS") {
      handleOptions(req, res, corsOrigin);
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

    // Match /api/v1/stream?executionId=... for SDK compatibility
    if (pathname === "/api/v1/stream") {
      const queryIdx = url.indexOf("?");
      const params = new URLSearchParams(queryIdx >= 0 ? url.slice(queryIdx) : "");
      const executionId = params.get("executionId") || "";
      if (executionId) {
        handleExecutionSseStream(req, res, executionId, deps);
        return;
      }
    }

    handleNotFound(res);
  };
}
