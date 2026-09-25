/**
 * @file apps/gateway/src/middleware/cors.middleware.ts
 * @description Cross-Origin Resource Sharing (CORS) handler and preflight responder.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes";

/**
 * Handles CORS headers and responds immediately to preflight OPTIONS requests.
 * Supports multi-origin matching, credential sharing, and all required SDK headers.
 *
 * @param req - Inbound gateway request
 * @param res - Outbound gateway response
 * @param allowedOrigin - Configured allowed origin(s) (comma-separated or wildcard)
 * @returns True if request was an OPTIONS preflight and was handled; false otherwise
 */
export function handleCors(
  req: GatewayRequest,
  res: GatewayResponse,
  allowedOrigin: string = "*",
): boolean {
  const requestOrigin = req.headers.origin;
  let effectiveOrigin = allowedOrigin;

  // Resolve matching origin if configured with wildcard or multi-origin list
  if (allowedOrigin === "*") {
    effectiveOrigin = requestOrigin || "*";
  } else if (requestOrigin) {
    const origins = allowedOrigin.split(",").map((o) => o.trim());
    if (origins.includes(requestOrigin) || origins.includes("*")) {
      effectiveOrigin = requestOrigin;
    } else {
      effectiveOrigin = origins[0] || "*";
    }
  }

  res.setHeader("Access-Control-Allow-Origin", effectiveOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Tenant-ID, X-Request-ID, Idempotency-Key, idempotency-key, X-Signature, X-Timestamp, X-Client-ID",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Length, Content-Type, Retry-After, X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
  );

  // If preflight request, immediately acknowledge with 204 No Content
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
