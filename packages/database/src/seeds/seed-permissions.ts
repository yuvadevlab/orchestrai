/**
 * @file packages/database/src/seeds/seed-permissions.ts
 * @description Database seeder for platform permissions.
 * Uses ToolPermissionLevel enum and zero-overwrite idempotent upsert.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { ToolPermissionLevel } from "@orchestrai/shared-types";

export const SEED_PERMISSIONS = [
  {
    permissionId: "317d6a62-a415-4e17-b1cb-5e2285c1780e",
    name: "Auto-run Safe",
    level: ToolPermissionLevel.READ_ONLY,
    description: "Read-only operations requiring zero manual confirmation",
    requiresApproval: false,
    sortOrder: 0,
  },
  {
    permissionId: "216de2f5-71a9-4ce7-b058-24d6ca33dfc8",
    name: "Workspace Write",
    level: ToolPermissionLevel.WRITE_SAFE,
    description: "Safe local workspace filesystem writes within project root",
    requiresApproval: false,
    sortOrder: 1,
  },
  {
    permissionId: "e4c27ba4-bdaa-4c19-8959-4497118028b2",
    name: "Sensitive Action",
    level: ToolPermissionLevel.SENSITIVE,
    description: "External mutations or sensitive network requests requiring human review",
    requiresApproval: true,
    sortOrder: 2,
  },
  {
    permissionId: "447b4339-9e30-439c-9aab-a2e568662cd5",
    name: "High Risk / Shell",
    level: ToolPermissionLevel.DANGEROUS,
    description: "Arbitrary shell, terminal, or system-level command execution",
    requiresApproval: true,
    sortOrder: 3,
  },
];

/**
 * Seeds platform permissions idempotently into PostgreSQL.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  for (const perm of SEED_PERMISSIONS) {
    await prisma.platformPermission.upsert({
      where: { permissionId: perm.permissionId },
      update: {}, // Preserve existing data
      create: perm,
    });
  }
}
