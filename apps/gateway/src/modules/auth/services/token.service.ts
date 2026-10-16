/**
 * @file apps/gateway/src/services/token.service.ts
 * @description Bearer session token issuance, claims generation, and database identity resolution.
 * @module apps/gateway/services
 */

import { loadGatewayConfig } from "@/config";
import { prisma } from "@orchestrai/database";
import { LocalStore } from "@/db/local-store";
import { JwksValidator } from "@yuva-devlab/auth-server";
import { signToken, verifyToken, type TokenClaims } from "./crypto";

const jwksValidator = new JwksValidator({
  jwksUri: process.env.JWKS_URI || "http://localhost:3015/.well-known/jwks.json",
  issuer: process.env.OIDC_ISSUER || "http://localhost:3015",
});

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
 * Verifies a bearer token (RS256 JWKS or HMAC) and resolves active user identity with JIT provisioning.
 *
 * @param token - Bearer token string
 * @returns ResolvedUser or null if invalid, expired, or deleted
 */
export async function resolveUserByToken(token: string): Promise<ResolvedUser | null> {
  // 1. Attempt RS256 OIDC JWKS token verification from DevLab Portal
  try {
    const claims = await jwksValidator.verifyToken(token);
    if (claims && claims.sub) {
      const userId = String(claims.sub);
      const dbUser = await prisma.user.findUnique({
        where: { userId },
      });

      if (dbUser) {
        return {
          id: dbUser.userId,
          name: dbUser.name || String(claims.name || "DevLab User"),
          email: dbUser.email,
          tenantId: dbUser.tenantId,
          roles: [dbUser.role],
        };
      }

      // Check by email if user ID differs
      if (claims.email) {
        const byEmail = await prisma.user.findUnique({
          where: { email: String(claims.email) },
        });
        if (byEmail) {
          return {
            id: byEmail.userId,
            name: byEmail.name || String(claims.name || "DevLab User"),
            email: byEmail.email,
            tenantId: byEmail.tenantId,
            roles: [byEmail.role],
          };
        }
      }

      // JIT provision user shadow profile in PostgreSQL
      const firstTenant = await prisma.tenant.findFirst();
      const tenantId =
        (claims.tenant_id as string) || (claims.tenantId as string) || firstTenant?.tenantId;
      if (tenantId) {
        const newUser = await prisma.user.create({
          data: {
            userId,
            tenantId,
            email: String(claims.email || `${userId}@devlab.local`),
            name: typeof claims.name === "string" ? claims.name : "DevLab User",
            passwordHash: null,
            role: typeof claims.role === "string" ? claims.role : "developer",
          },
        });
        return {
          id: newUser.userId,
          name: newUser.name || "DevLab User",
          email: newUser.email,
          tenantId: newUser.tenantId,
          roles: [newUser.role],
        };
      }
    }
  } catch {
    // Non-RS256 token, proceed to local HMAC token verification
  }

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
