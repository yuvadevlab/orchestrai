/**
 * @file packages/database/src/seeds/seed-roles-tools.ts
 * @description Orchestrator for platform permissions, roles, and tools seeders.
 * Modularized to adhere strictly to the < 250 LOC rule with zero data loss.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { seedPermissions } from "./seed-permissions";
import { seedRoles } from "./seed-roles";
import { seedTools } from "./seed-tools";

export * from "./seed-permissions";
export * from "./seed-roles";
export * from "./seed-tools";

/**
 * Seeds default permissions, roles, and tools idempotently into PostgreSQL.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedRolesAndTools(prisma: PrismaClient): Promise<void> {
  await seedPermissions(prisma);
  await seedRoles(prisma);
  await seedTools(prisma);
}
