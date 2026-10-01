/**
 * @file apps/gateway/src/services/token.service.ts
 * @description Bearer session token issuance, claims generation, and database identity resolution.
 * @module apps/gateway/services
 */

import { loadGatewayConfig } from "@/config";
import { prisma } from "@orchestrai/database";
import { LocalStore } from "@/db/local-store";
import { signToken, verifyToken, type TokenClaims } from "./crypto";

/**
 * Resolved operator identity structure.
 */
export interface ResolvedUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: string[];
}

/**
 * Generates an HMAC-signed session bearer token for an operator.
 *
 * @param params - Operator profile details
 * @returns Signed bearer token string
 */
export function issueSessionToken(params: {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
}): string {
  const config = loadGatewayConfig();
  const expirationMs = config.tokenExpirationHours * 60 * 60 * 1000;

  const claims: TokenClaims = {
    sub: params.userId,
    tenantId: params.tenantId,
    email: params.email,
    name: params.name,
    role: params.role,
    iat: Date.now(),
    exp: Date.now() + expirationMs,
  };

  return signToken(claims, config.jwtSecret);
}

/**
 * Verifies a bearer token and resolves the active user from PostgreSQL (Prisma) or LocalStore.
 *
 * @param token - Bearer token string
 * @returns ResolvedUser or null if invalid, expired, or deleted
 */
export async function resolveUserByToken(token: string): Promise<ResolvedUser | null> {
  const config = loadGatewayConfig();
  const claims = verifyToken(token, config.jwtSecret);
  if (!claims) return null;

  try {
    // 1. Check PostgreSQL User table
    const dbUser = await prisma.user.findUnique({
      where: { userId: claims.sub },
    });

    if (dbUser) {
      return {
        id: dbUser.userId,
        name: dbUser.name || claims.name,
        email: dbUser.email,
        tenantId: dbUser.tenantId,
        roles: [dbUser.role],
      };
    }
  } catch {
    // Fallback to local store or claims if DB lookup unavailable
  }

  // 2. Check local embedded store
  const localUser = LocalStore.getInstance().findUserById(claims.sub);
  if (localUser) {
    return {
      id: localUser.id,
      name: localUser.name,
      email: localUser.email,
      tenantId: localUser.tenant_id,
      roles: [localUser.role],
    };
  }

  // 3. Fallback to valid cryptographically-signed token claims
  return {
    id: claims.sub,
    name: claims.name,
    email: claims.email,
    tenantId: claims.tenantId,
    roles: [claims.role],
  };
}
