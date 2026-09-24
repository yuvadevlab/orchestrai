/**
 * @file apps/gateway/src/middleware/admin.middleware.ts
 * @description Authorization guard verifying administrator privileges from request context.
 * @module apps/gateway/middleware
 */

import type { GatewayRequest, GatewayResponse, RouteHandler } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";

/** Allowed role identifiers with platform administrative permissions. */
const ADMIN_ROLES = new Set(["admin", "super_admin", "owner", "system"]);

/**
 * Validates that the requesting user context holds an administrative role.
 * Responds with HTTP 403 Forbidden and returns false if unauthorized.
 *
 * @param req - Inbound gateway request carrying context and roles
 * @param res - Outbound gateway response
 * @returns boolean indicating whether the user possesses admin privileges
 */
export function requireAdmin(req: GatewayRequest, res: GatewayResponse): boolean {
  const roles: string[] = req.context?.roles ?? [];
  const isAdmin = roles.some((role) => ADMIN_ROLES.has(role));

  if (!isAdmin) {
    sendJson(res, 403, {
      error: {
        code: "FORBIDDEN",
        message: "Admin or super_admin privileges required for this resource",
        requestId: req.context?.requestId,
      },
    });
    return false;
  }

  return true;
}

/**
 * Higher-order middleware wrapper ensuring a route handler only executes for admins.
 *
 * @param handler - Target route handler
 * @returns Wrapped RouteHandler enforcing admin authorization
 */
export function withAdmin(handler: RouteHandler): RouteHandler {
  return async (req: GatewayRequest, res: GatewayResponse): Promise<void> => {
    if (!requireAdmin(req, res)) {
      return;
    }
    await handler(req, res);
  };
}
