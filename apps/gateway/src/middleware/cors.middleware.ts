/**
 * @file apps/gateway/src/middleware/cors.middleware.ts
 * @description Cross-Origin Resource Sharing (CORS) handler and preflight responder.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes";

/**
 * Handles CORS headers and responds immediately to preflight OPTIONS requests.
 *
 * @param req - Inbound gateway request
 * @param res - Outbound gateway response
 * @param allowedOrigin - Configured allowed origin (e.g. '*' or domain)
 * @returns True if request was an OPTIONS preflight and was handled; false otherwise
 */
export function handleCors(
  req: GatewayRequest,
  res: GatewayResponse,
  allowedOrigin: string = "*",
): boolean {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Tenant-ID, X-Request-ID",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Max-Age", "86400");

  // If preflight request, immediately acknowledge with 204 No Content
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
