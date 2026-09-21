/**
 * @file apps/gateway/src/context/request-context.ts
 * @description Request execution context carrying tenancy, authentication, and tracing IDs.
 */

import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

/**
 * Normalized context extracted from headers and auth tokens for an inbound request.
 */
export interface RequestContext {
  /** Unique request trace identifier */
  requestId: string;
  /** Tenancy isolation partition identifier */
  tenantId: string;
  /** Identity identifier of the calling user or system */
  userId: string;
  /** Client remote network IP */
  clientIp: string;
  /** Optional API key identifier if authenticated via machine key */
  apiKeyId?: string;
  /** Whether the request was successfully verified by auth middleware */
  authenticated: boolean;
  /** Assigned authorization roles */
  roles: string[];
}

/**
 * Factory creating a fresh RequestContext from an incoming HTTP message.
 *
 * @param req - Node.js IncomingMessage
 * @returns Initialized RequestContext
 */
export function createRequestContext(
  req: IncomingMessage,
  tenantHeaderName: string = "x-tenant-id",
): RequestContext {
  // Extract or generate correlation trace ID
  const rawTraceId = req.headers["x-request-id"] || req.headers["x-correlation-id"];
  const requestId = typeof rawTraceId === "string" && rawTraceId ? rawTraceId : randomUUID();

  // Extract tenant header if supplied (default partition used for initial development)
  const headerKey = tenantHeaderName.toLowerCase();
  const rawTenantId = req.headers[headerKey];
  const tenantId = typeof rawTenantId === "string" && rawTenantId ? rawTenantId : "default-tenant";

  // Determine remote IP from forward headers or socket address
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0]?.trim() || "127.0.0.1"
      : req.socket.remoteAddress || "127.0.0.1";

  return {
    requestId,
    tenantId,
    userId: "anonymous",
    clientIp,
    authenticated: false,
    roles: [],
  };
}
