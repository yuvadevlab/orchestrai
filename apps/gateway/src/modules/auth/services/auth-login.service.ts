/**
 * @file apps/gateway/src/services/auth-login.ts
 * @description Authentication login execution querying PostgreSQL Prisma client with LocalStore fallback.
 * @module apps/gateway/services
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { prisma } from "@orchestrai/database";
import { LocalStore } from "@/db/local-store";
import { verifyPassword } from "./crypto";
import { issueSessionToken } from "./token.service";
import type { LoginRequest } from "@/validation/auth.schema";

const logger = loggerWithConfig(new Logger("AuthLoginService"));

/** Response payload returning authenticated user profile and bearer token */
export interface AuthResponsePayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
}

/**
 * Authenticates user credentials against PostgreSQL, falling back to LocalStore if database is unreachable.
 *
 * @param req - LoginRequest containing email and password
 * @returns AuthResponsePayload containing session token and profile
 */
export async function authenticateLogin(req: LoginRequest): Promise<AuthResponsePayload> {
  const emailKey = req.email.toLowerCase().trim();

  try {
    // 1. Query user by email from PostgreSQL via Prisma Client
    const dbUser = await prisma.user.findUnique({
      where: { email: emailKey },
      include: { tenant: true },
    });

    if (dbUser) {
      const isValid = verifyPassword(req.password, dbUser.passwordHash);
      if (!isValid) {
        logger.warn("[AuthLogin] Login failed: Incorrect password", { email: req.email });
        throw new Error("Incorrect password. Please verify your credentials.");
      }

      const userName = dbUser.name || dbUser.email.split("@")[0] || "Operator";
      const token = issueSessionToken({
        userId: dbUser.userId,
        tenantId: dbUser.tenantId,
        email: dbUser.email,
        name: userName,
        role: dbUser.role,
      });

      logger.info("[AuthLogin] User authenticated successfully from PostgreSQL", {
        userId: dbUser.userId,
        tenantId: dbUser.tenantId,
      });

      return {
        token,
        user: {
          id: dbUser.userId,
          name: userName,
          email: dbUser.email,
          tenantId: dbUser.tenantId,
          roles: [dbUser.role],
        },
      };
    }
  } catch (err) {
    // Rethrow known validation/password errors directly
    if (err instanceof Error && err.message.includes("Incorrect password")) {
      throw err;
    }
    logger.warn("[AuthLogin] PostgreSQL lookup skipped/failed; attempting local store", {
      error: String(err),
    });
  }

  // 2. Fallback to LocalStore if DB is offline or user exists locally
  const localUser = LocalStore.getInstance().findUserByEmail(emailKey);
  if (!localUser) {
    logger.warn("[AuthLogin] Login failed: User account not found", { email: req.email });
    throw new Error(
      "No account found with this email address. Please sign up or check your credentials.",
    );
  }

  const isValid = verifyPassword(req.password, localUser.password_hash);
  if (!isValid) {
    logger.warn("[AuthLogin] Login failed: Incorrect password", { email: req.email });
    throw new Error("Incorrect password. Please verify your credentials.");
  }

  const userName = localUser.name || localUser.email.split("@")[0] || "Operator";
  const token = issueSessionToken({
    userId: localUser.id,
    tenantId: localUser.tenant_id,
    email: localUser.email,
    name: userName,
    role: localUser.role,
  });

  return {
    token,
    user: {
      id: localUser.id,
      name: userName,
      email: localUser.email,
      tenantId: localUser.tenant_id,
      roles: [localUser.role],
    },
  };
}
