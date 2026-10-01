/**
 * @file apps/admin/src/middleware/cors.middleware.ts
 * @description Cross-Origin Resource Sharing handler for operator admin endpoints.
 * @module apps/admin/middleware
 */

import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Handles CORS headers and HTTP OPTIONS preflight checks.
 *
 * @param req - Inbound HTTP request
 * @param res - Outbound HTTP response
 * @param allowedOrigins - Array of allowed origin patterns
 * @returns True if preflight OPTIONS was completed and request is fully handled
 */
export function handleAdminCors(
  req: IncomingMessage,
  res: ServerResponse,
  allowedOrigins: readonly string[],
  extraHeaders: readonly string[] = [],
): boolean {
  const origin = req.headers.origin;

  // Check if wildcard or specific matched origin
  if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  const baseHeaders = ["Content-Type", "Authorization", "X-Request-Id", "X-Tenant-Id", "X-API-Key"];
  const allHeaders = Array.from(new Set([...baseHeaders, ...extraHeaders])).join(", ");

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", allHeaders);
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Intercept and resolve preflight immediately
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
