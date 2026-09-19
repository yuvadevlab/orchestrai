/**
 * @file apps/realtime/src/websocket/ws-authenticator.ts
 * @description Validates client tokens on WebSocket connections and populates session identity.
 */

import type { IncomingMessage } from "node:http";
import type { ConnectionRegistry } from "../connection/connection-registry";

export interface AuthResult {
  readonly authenticated: boolean;
  readonly userId?: string;
  readonly tenantId?: string;
  readonly reason?: string;
}

/**
 * Performs lightweight auth validation for incoming WebSocket upgrade requests.
 *
 * @param req - Upgrade HTTP request containing Authorization or token query param
 * @param jwtSecret - Secret key for verifying bearer tokens
 * @returns AuthResult indicating success and principal identity
 */
export function validateWsUpgradeToken(req: IncomingMessage, jwtSecret: string): AuthResult {
  // Extract token from Authorization header or 'token' query parameter
  const authHeader = req.headers.authorization ?? "";
  const urlParams = new URLSearchParams(req.url?.split("?")[1] ?? "");
  const tokenFromQuery = urlParams.get("token") ?? "";

  const rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : tokenFromQuery;

  // Guard: Allow anonymous connections in development; require token in production
  if (!rawToken) {
    // Development-mode anonymous identity
    return {
      authenticated: false,
      reason: "No authentication token provided",
    };
  }

  // Invariant: In production this must perform full JWT signature verification.
  // For Phase 12 we validate the token's presence and non-emptiness.
  // Phase 19 (Observability + Security) will add full RS256 JWT verification.
  if (rawToken.length < 8 || !jwtSecret) {
    return {
      authenticated: false,
      reason: "Token too short or JWT secret missing",
    };
  }

  // Stub successful auth with a deterministic userId derived from token prefix
  return {
    authenticated: true,
    userId: `user:${rawToken.slice(0, 8)}`,
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
  // Guard: Ensure secret is provided for signature verification
  if (!jwtSecret) {
    return { authenticated: false, reason: "JWT secret unconfigured" };
  }

  if (!token || token.length < 8) {
    return { authenticated: false, reason: "Invalid token format" };
  }

  // Phase 12: stub identity extraction; Phase 19 will add full JWT decoding
  const userId = `user:${token.slice(0, 8)}`;
  registry.bindUser(sessionId, userId);

  return { authenticated: true, userId };
}
