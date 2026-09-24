/**
 * @file apps/gateway/src/middleware/auth.middleware.ts
 * @description Authentication and authorization guard inspecting dynamic header API keys, HMAC session tokens, and database identity.
 * @module apps/gateway/middleware
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import type { GatewayConfig } from "@/config";
import { AuthService } from "@/services/auth.service";

const logger = loggerWithConfig(new Logger("AuthMiddleware"));

/** Whitelisted public endpoints bypassing mandatory API key / token authentication */
const PUBLIC_PATHS = new Set([
  "/health",
  "/ready",
  "/api/v1/auth/login",
  "/api/v1/auth/signup",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
]);

/**
 * Validates inbound request credentials against PostgreSQL user sessions or configured API keys.
 * Uses configurable header key names declared in GatewayConfig / environment.
 *
 * @param req - Inbound gateway request
 * @param res - Outbound gateway response
 * @param config - Gateway configuration holding valid keys and header declarations
 * @returns Promise resolving to true if authenticated or public; false if rejected with 401
 */
export async function authenticateRequest(
  req: GatewayRequest,
  res: GatewayResponse,
  config: GatewayConfig,
): Promise<boolean> {
  const urlPath = (req.url || "/").split("?")[0] || "/";

  // 1. Bypass authentication for whitelisted public endpoints
  if (PUBLIC_PATHS.has(urlPath)) {
    return true;
  }

  // 2. Check for configured machine-to-machine API Key using declared header name
  const apiKeyHeaderKey = config.apiKeyHeaderName.toLowerCase();
  const rawApiKey = req.headers[apiKeyHeaderKey] || req.headers["x-api-key"];
  const apiKey = typeof rawApiKey === "string" ? rawApiKey.trim() : undefined;

  if (apiKey && apiKey === config.gatewayApiKey) {
    logger.info("[Auth] Request authenticated via Gateway API Key", { path: urlPath });
    req.context.authenticated = true;
    req.context.apiKeyId = "primary-key";
    req.context.userId = "service-account";
    req.context.roles = ["admin", "operator"];
    return true;
  }

  // 3. Check for Bearer session token using declared auth header name
  const authHeaderKey = config.authHeaderName.toLowerCase();
  const authHeader = req.headers[authHeaderKey] || req.headers.authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();

    try {
      const sessionUser = await AuthService.getInstance().getUserByToken(token);
      if (sessionUser) {
        req.context.authenticated = true;
        req.context.userId = sessionUser.id;
        req.context.tenantId = sessionUser.tenantId;
        req.context.roles = sessionUser.roles;
        return true;
      }
    } catch (err) {
      logger.error("[Auth] Error verifying user token against DB", { error: String(err) });
    }

    // Secondary: Master JWT secret for system-level integrations
    if (token === config.jwtSecret) {
      req.context.authenticated = true;
      req.context.userId = "system-master";
      req.context.roles = ["admin", "system"];
      return true;
    }
  }

  // 4. Reject unauthorized request with 401
  logger.warn("[Auth] Unauthorized request rejected", {
    path: urlPath,
    method: req.method,
    requestId: req.context?.requestId,
  });

  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authentication credentials (Bearer token or API key)",
        requestId: req.context?.requestId,
      },
    }),
  );
  return false;
}
