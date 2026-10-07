/**
 * @file apps/admin/src/middleware/cors.middleware.ts
 * @description Cross-Origin Resource Sharing handler for operator admin endpoints.
 * @module apps/admin/middleware
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { HEADER_NAMES, HttpMethod, HttpStatus } from "@orchestrai/shared-types";

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

  const baseHeaders = [
    HEADER_NAMES.CONTENT_TYPE,
    HEADER_NAMES.AUTHORIZATION,
    HEADER_NAMES.X_REQUEST_ID,
    HEADER_NAMES.X_TENANT_ID,
    HEADER_NAMES.X_API_KEY,
  ];
  const allHeaders = Array.from(new Set([...baseHeaders, ...extraHeaders])).join(", ");

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", allHeaders);
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Intercept and resolve preflight immediately
  if (req.method === HttpMethod.OPTIONS) {
    res.statusCode = HttpStatus.NO_CONTENT;
    res.end();
    return true;
  }

  return false;
}
