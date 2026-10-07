/**
 * @file packages/database/src/seed-platform-manifest.ts
 * @description Orchestrator for synchronizing cognitive policies, system prompts, platform configs, and feature flags.
 * Completely idempotent with zero data loss guarantee.
 * @module @orchestrai/database
 */

import type { PrismaClient } from "@prisma/client";
import { seedCognitivePolicies } from "./seeds/seed-cognitive-policies";
import { seedSystemPrompts } from "./seeds/seed-system-prompts";
import { seedPlatformConfigs } from "./seeds/seed-platform-configs";
import { seedFeatureFlags } from "./seeds/seed-feature-flags";

/**
 * Seeds or synchronizes foundational platform manifest entities into PostgreSQL.
 * Safe to execute on every boot; never overwrites existing records or user data.
 *
 * @param prisma - Active PrismaClient instance
 */
export async function seedPlatformManifest(prisma: PrismaClient): Promise<void> {
  await seedCognitivePolicies(prisma);
  await seedSystemPrompts(prisma);
  await seedPlatformConfigs(prisma);
  await seedFeatureFlags(prisma);
}
