/**
 * @file apps/admin/src/context.ts
 * @description Inbound request context propagation for the Operator Control Plane.
 * @module apps/admin/context
 */

import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { OperatorRole } from "@orchestrai/shared-types";

/**
 * Contextual metadata attached to every incoming operator request.
 */
export interface AdminRequestContext {
  readonly requestId: string;
  readonly timestamp: number;
  operatorId?: string;
  tenantId?: string;
  roles: OperatorRole[];
  authenticated: boolean;
}

/**
 * Creates a normalized RequestContext from an incoming Node.js HTTP request.
 *
 * @param req - Inbound Node.js HTTP request
 * @param requestIdHeaderName - Configured header name for correlation request ID
 * @param tenantHeaderName - Configured header name for tenant identification
 * @returns Initialized AdminRequestContext
 */
export function createAdminRequestContext(
  req: IncomingMessage,
  requestIdHeaderName = "x-request-id",
  tenantHeaderName = "x-tenant-id",
): AdminRequestContext {
  const reqKey = requestIdHeaderName.toLowerCase();
  const reqHeader = req.headers[reqKey] || req.headers["x-request-id"];
  const requestId = typeof reqHeader === "string" ? reqHeader : randomUUID();

  const tenantKey = tenantHeaderName.toLowerCase();
  const tenantHeader = req.headers[tenantKey] || req.headers["x-tenant-id"];
  const tenantId = typeof tenantHeader === "string" ? tenantHeader : undefined;

  return {
    requestId,
    timestamp: Date.now(),
    operatorId: undefined,
    tenantId,
    roles: [],
    authenticated: false,
  };
}
