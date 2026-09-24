/**
 * @file apps/realtime/src/websocket/ws-authenticator.ts
 * @description Validates HMAC signed tokens on WebSocket connections and populates session identity.
 * @module apps/realtime/websocket
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { ConnectionRegistry } from "@/connection";

export interface AuthResult {
  readonly authenticated: boolean;
  readonly userId?: string;
  readonly tenantId?: string;
  readonly email?: string;
  readonly reason?: string;
}

interface DecodedClaims {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Verifies an HMAC-SHA256 session token against configured secret.
 */
function verifySessionToken(token: string, secret: string): DecodedClaims | null {
  try {
    if (!token.startsWith("orch_tok.")) return null;
    const parts = token.slice("orch_tok.".length).split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, providedSignature] = parts;
    if (!encodedPayload || !providedSignature) return null;

    const expectedSignature = createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8"),
    ) as DecodedClaims;
    if (Date.now() > decoded.exp) return null;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Performs auth validation for incoming WebSocket upgrade requests.
 *
 * @param req - Upgrade HTTP request containing Authorization or token query param
 * @param jwtSecret - Secret key for verifying bearer tokens
 * @returns AuthResult indicating success and principal identity
 */
export function validateWsUpgradeToken(req: IncomingMessage, jwtSecret: string): AuthResult {
  const authHeader = req.headers.authorization ?? "";
  const urlParams = new URLSearchParams(req.url?.split("?")[1] ?? "");
  const tokenFromQuery = urlParams.get("token") ?? "";

  const rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : tokenFromQuery;

  if (!rawToken) {
    return { authenticated: false, reason: "No authentication token provided" };
  }

  if (!jwtSecret) {
    return { authenticated: false, reason: "JWT secret unconfigured" };
  }

  const claims = verifySessionToken(rawToken, jwtSecret);
  if (!claims) {
    return { authenticated: false, reason: "Invalid or expired token" };
  }

  return {
    authenticated: true,
    userId: claims.sub,
    tenantId: claims.tenantId,
    email: claims.email,
  };
}

/**
 * Authenticates a named session via the AUTH WebSocket frame and updates registry.
 *
 * @param sessionId - Unique ID of the connecting session
 * @param token - Authentication bearer token from the AUTH frame
 * @param jwtSecret - Secret key for verification
 * @param registry - Connection registry to bind the resolved principal
 * @returns AuthResult with resolved identity
 */
export function authenticateSession(
  sessionId: string,
  token: string,
  jwtSecret: string,
  registry: ConnectionRegistry,
): AuthResult {
  if (!jwtSecret) {
    return { authenticated: false, reason: "JWT secret unconfigured" };
  }

  const claims = verifySessionToken(token, jwtSecret);
  if (!claims) {
    return { authenticated: false, reason: "Invalid or expired token" };
  }

  registry.bindUser(sessionId, claims.sub);
  return {
    authenticated: true,
    userId: claims.sub,
    tenantId: claims.tenantId,
    email: claims.email,
  };
}
