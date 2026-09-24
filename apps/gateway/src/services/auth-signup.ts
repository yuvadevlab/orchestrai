/**
 * @file apps/gateway/src/services/auth-signup.ts
 * @description Authentication registration service persisting new tenants and operators to PostgreSQL with LocalStore fallback.
 * @module apps/gateway/services
 */

import { randomUUID, randomBytes } from "node:crypto";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { prisma, type Prisma } from "@orchestrai/database";
import { LocalStore } from "@/db/local-store";
import { hashPassword } from "./crypto";
import { issueSessionToken } from "./token.service";
import type { SignupRequest } from "@/validation/auth.schema";
import type { AuthResponsePayload } from "./auth-login";

const logger = loggerWithConfig(new Logger("AuthSignupService"));

/**
 * Registers a new operator user and tenant workspace atomically.
 *
 * @param req - SignupRequest containing user details and password
 * @returns AuthResponsePayload containing issued session token and user profile
 */
export async function registerSignup(req: SignupRequest): Promise<AuthResponsePayload> {
  const emailKey = req.email.toLowerCase().trim();
  const rawName = req.name ? req.name.trim() : emailKey.split("@")[0] || "Operator";
  const passwordHash = hashPassword(req.password);
  const tenantName = `${rawName}'s Workspace`;
  const tenantSlug = `${rawName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 30)}-${randomBytes(4).toString("hex")}`;

  try {
    // 1. Check if user already exists in PostgreSQL
    const existingUser = await prisma.user.findUnique({
      where: { email: emailKey },
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists. Please sign in.");
    }

    // 2. Atomic creation of Tenant and User via Prisma transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.tenantId,
          email: emailKey,
          name: rawName,
          passwordHash,
          role: "admin",
        },
      });

      return { tenant, user };
    });

    const token = issueSessionToken({
      userId: result.user.userId,
      tenantId: result.tenant.tenantId,
      email: result.user.email,
      name: result.user.name || rawName,
      role: result.user.role,
    });

    logger.info("[AuthSignup] New tenant and user persisted to PostgreSQL", {
      userId: result.user.userId,
      tenantId: result.tenant.tenantId,
    });

    return {
      token,
      user: {
        id: result.user.userId,
        name: result.user.name || rawName,
        email: result.user.email,
        tenantId: result.tenant.tenantId,
        roles: [result.user.role],
      },
    };
  } catch (err) {
    // Rethrow conflict errors directly
    if (err instanceof Error && err.message.includes("already exists")) {
      throw err;
    }
    logger.warn("[AuthSignup] PostgreSQL signup failed; falling back to LocalStore", {
      error: String(err),
    });
  }

  // 3. Fallback: Persist in LocalStore if PostgreSQL unavailable
  const store = LocalStore.getInstance();
  const existingLocal = store.findUserByEmail(emailKey);
  if (existingLocal) {
    throw new Error("An account with this email address already exists. Please sign in.");
  }

  const userId = randomUUID();
  const tenantId = randomUUID();
  const now = new Date().toISOString();

  store.createTenant({ id: tenantId, name: tenantName, plan: "ENTERPRISE", created_at: now });
  store.createUser({
    id: userId,
    tenant_id: tenantId,
    email: emailKey,
    name: rawName,
    password_hash: passwordHash,
    role: "admin",
    created_at: now,
    updated_at: now,
  });

  const token = issueSessionToken({
    userId,
    tenantId,
    email: emailKey,
    name: rawName,
    role: "admin",
  });

  return {
    token,
    user: {
      id: userId,
      name: rawName,
      email: emailKey,
      tenantId,
      roles: ["admin"],
    },
  };
}
