/**
 * @file apps/gateway/src/services/tenant-resolver.ts
 * @description Resolves or creates a valid database tenant UUID and fallback agent for operations.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves a valid tenant UUID from database.
 * If provided tenantId is a valid UUID and exists, returns it.
 * Otherwise returns the default platform tenant or creates one.
 *
 * @param tenantId - Optional candidate tenant ID
 * @param db - Optional PrismaClient instance
 * @returns Valid database tenant UUID
 */
export async function resolveDbTenantId(
  tenantId?: string,
  db: PrismaClient = getPrismaClient(),
): Promise<string> {
  if (tenantId && UUID_REGEX.test(tenantId)) {
    const existing = await db.tenant.findUnique({
      where: { tenantId },
      select: { tenantId: true },
    });
    if (existing) {
      return existing.tenantId;
    }
  }

  const firstTenant = await db.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { tenantId: true },
  });

  if (firstTenant) {
    return firstTenant.tenantId;
  }

  const created = await db.tenant.create({
    data: {
      name: "Default Workspace",
      slug: "default",
    },
    select: { tenantId: true },
  });

  return created.tenantId;
}

/**
 * Finds the first active agent for a tenant, or throws an error if none exists.
 *
 * @param tenantId - Resolved tenant UUID
 * @param db - Optional PrismaClient instance
 * @returns Valid agentId UUID
 */
export async function resolveOrCreateDefaultAgent(
  tenantId: string,
  db: PrismaClient = getPrismaClient(),
): Promise<string> {
  const existing = await db.agent.findFirst({
    where: { tenantId, deletedAt: null },
    select: { agentId: true },
  });

  if (existing) {
    return existing.agentId;
  }

  throw new Error(
    "No agent found for tenant. Please create an agent in Studio or via the Agent API before proceeding.",
  );
}
