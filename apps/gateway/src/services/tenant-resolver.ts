/**
 * @file apps/gateway/src/services/tenant-resolver.ts
 * @description Resolves or creates a valid database tenant UUID for tenant-scoped operations.
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
 * @returns Valid database tenant UUID
 */
export async function resolveDbTenantId(
  tenantId?: string,
  db: PrismaClient = getPrismaClient(),
): Promise<string> {
  // If candidate is a valid UUID, verify existence in DB
  if (tenantId && UUID_REGEX.test(tenantId)) {
    const existing = await db.tenant.findUnique({
      where: { tenantId },
      select: { tenantId: true },
    });
    if (existing) {
      return existing.tenantId;
    }
  }

  // Fallback to first existing tenant in PostgreSQL
  const firstTenant = await db.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { tenantId: true },
  });

  if (firstTenant) {
    return firstTenant.tenantId;
  }

  // Create default tenant if table is completely empty
  const created = await db.tenant.create({
    data: {
      name: "Default Workspace",
      slug: "default",
    },
    select: { tenantId: true },
  });

  return created.tenantId;
}
