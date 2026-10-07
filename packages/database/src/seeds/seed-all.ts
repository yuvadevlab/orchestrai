/**
 * @file packages/database/src/seeds/seed-all.ts
 * @description Master database seed orchestrator running all seed modules idempotently.
 * Never deletes, drops, or truncates existing user or platform data.
 * @module @orchestrai/database/seeds
 */

import { getPrismaClient, type PrismaClient } from "../client";
import { seedProvidersAndModels } from "./seed-providers-models";
import { seedModesAndNav } from "./seed-modes-nav";
import { seedRolesAndTools } from "./seed-roles-tools";
import { seedDefaultCapabilities } from "../seed-capabilities";
import { seedAgents } from "./seed-agents";
import { seedPlatformManifest } from "../seed-platform-manifest";

/**
 * Executes all platform seeds in dependency order with complete idempotence.
 * Safe to execute on every boot; never overwrites existing records or user data.
 *
 * @param client - Optional PrismaClient instance
 */
export async function seedAllPlatformData(client?: PrismaClient): Promise<void> {
  const prisma = client ?? getPrismaClient();

  // 1. Providers and Models
  await seedProvidersAndModels(prisma);

  // 2. Execution Modes and Navigation Items
  await seedModesAndNav(prisma);

  // 3. Permissions, Roles, and Tools Catalog
  await seedRolesAndTools(prisma);

  // 4. System Capabilities
  await seedDefaultCapabilities(prisma);

  // 5. Default Tenant and Specialist Agents
  await seedAgents(prisma);

  // 6. Dynamic Manifest: Cognitive Policies, System Prompts, Configs, Flags
  await seedPlatformManifest(prisma);
}
