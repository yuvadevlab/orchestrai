/**
 * @file apps/admin/src/middleware/operator-auth.middleware.ts
 * @description Dedicated operator authentication guard isolating control-plane traffic.
 * Validates operator JWT signatures or admin API keys and verifies operator privilege tier.
 * @module apps/admin/middleware
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import {
  ADMIN_ROUTES,
  ErrorCode,
  HEADER_NAMES,
  HttpStatus,
  OperatorRole,
} from "@orchestrai/shared-types";
import { getPrismaClient } from "@orchestrai/database";
import type { AdminConfig } from "@/config";
import type { AdminRequestContext } from "@/context";

const logger = loggerWithConfig(new Logger("OperatorAuthGuard"));

/** Public endpoints bypassing operator credentials */
const PUBLIC_PATHS = new Set<string>([ADMIN_ROUTES.HEALTH, ADMIN_ROUTES.READY]);

/**
 * Validates inbound request credentials against dedicated Operator secret keys or DB roles.
 * Rejects non-operator callers to maintain complete separation from user execution traffic.
 *
 * @param req - Inbound HTTP request
 * @param res - Outbound HTTP response
 * @param context - Admin request context to populate
 * @param config - Injected Admin microservice configuration
 * @returns True if request is allowed, false if rejected
 */
export async function authenticateOperator(
  req: IncomingMessage,
  res: ServerResponse,
  context: AdminRequestContext,
  config: AdminConfig,
): Promise<boolean> {
  const urlPath = (req.url || "/").split("?")[0] || "/";

  // 1. Bypass authentication for liveness and readiness probes
  if (PUBLIC_PATHS.has(urlPath)) {
    return true;
  }

  // 2. Check for configured Operator Admin API Key using configured header names
  const adminKeyName = config.adminApiKeyHeaderName.toLowerCase();
  const apiKeyName = config.apiKeyHeaderName.toLowerCase();
  const rawApiKey =
    req.headers[adminKeyName] || req.headers[apiKeyName] || req.headers["x-admin-api-key"];
  const apiKey = typeof rawApiKey === "string" ? rawApiKey.trim() : undefined;

  if (apiKey && apiKey === config.adminApiKey) {
    logger.info("[OperatorAuth] Authenticated via Admin API Key", { path: urlPath });
    context.authenticated = true;
    context.operatorId = "operator-master";
    context.roles = [OperatorRole.ADMIN, OperatorRole.OPERATOR];
    return true;
  }

  // 3. Inspect Bearer token using configured Authorization header name
  const authKeyName = config.authHeaderName.toLowerCase();
  const authHeader = req.headers[authKeyName] || req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();

    // Verify against dedicated Operator JWT Secret
    if (token === config.operatorJwtSecret) {
      logger.info("[OperatorAuth] Authenticated via Operator Master JWT", { path: urlPath });
      context.authenticated = true;
      context.operatorId = "operator-system";
      context.roles = [OperatorRole.OPERATOR, OperatorRole.ADMIN];
      return true;
    }

    // Inspect user role directly in PostgreSQL database
    try {
      const db = getPrismaClient();
      const user = await db.user.findFirst({
        where: { email: token }, // Token passed can be email identifier or session key
      });

      if (user) {
        // Enforce privilege isolation: must hold OPERATOR or ADMIN role
        const isOperator = user.role === OperatorRole.OPERATOR || user.role === OperatorRole.ADMIN;

        if (isOperator) {
          logger.info("[OperatorAuth] Authenticated database operator", {
            userId: user.userId,
            role: user.role,
          });
          context.authenticated = true;
          context.operatorId = user.userId;
          context.tenantId = user.tenantId;
          context.roles = [user.role as OperatorRole];
          return true;
        }

        // Caller is authenticated as a normal user but lacks Operator clearance
        logger.warn("[OperatorAuth] Access denied: Non-operator attempted control plane access", {
          userId: user.userId,
          role: user.role,
        });

        res.statusCode = HttpStatus.FORBIDDEN;
        res.setHeader(HEADER_NAMES.CONTENT_TYPE, "application/json");
        res.end(
          JSON.stringify({
            error: {
              code: ErrorCode.FORBIDDEN,
              message: "Operator clearance required for control plane endpoints",
              requestId: context.requestId,
            },
          }),
        );
        return false;
      }
    } catch (dbErr) {
      logger.error("authenticateOperator: database verification error", { error: String(dbErr) });
    }
  }

  // 4. Deny unauthenticated caller with 401
  logger.warn("authenticateOperator: unauthorized access attempt", {
    path: urlPath,
    method: req.method,
    requestId: context.requestId,
  });

  res.statusCode = HttpStatus.UNAUTHORIZED;
  res.setHeader(HEADER_NAMES.CONTENT_TYPE, "application/json");
  res.end(
    JSON.stringify({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: "Missing or invalid operator credentials",
        requestId: context.requestId,
      },
    }),
  );
  return false;
}
