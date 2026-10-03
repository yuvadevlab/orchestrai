/**
 * @file packages/database/src/seeds/seed-feature-flags.ts
 * @description Database seeder for real-time feature flags, circuit breakers, and kill switches.
 * Enables sub-second deactivation of sensitive tools or emergency maintenance mode.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { FeatureFlagKey } from "@orchestrai/shared-types";

export interface FeatureFlagBlueprint {
  key: FeatureFlagKey;
  isEnabled: boolean;
  description: string;
}

export const SEED_FEATURE_FLAGS: readonly FeatureFlagBlueprint[] = [
  {
    key: FeatureFlagKey.KILL_SWITCH_BASH_TOOL,
    isEnabled: true,
    description: "Emergency circuit breaker for shell command execution",
  },
  {
    key: FeatureFlagKey.ENABLE_EXTENDED_THINKING,
    isEnabled: true,
    description: "Enables dynamic reasoning tokens and thinking traces",
  },
  {
    key: FeatureFlagKey.KILL_SWITCH_CRAWLER,
    isEnabled: true,
    description: "Emergency circuit breaker for web scraping and crawler agents",
  },
  {
    key: FeatureFlagKey.MAINTENANCE_MODE,
    isEnabled: false,
    description: "Global maintenance mode halting new agent execution turns",
  },
];

/**
 * Seeds feature flags and kill switches idempotently into PostgreSQL.
 * Uses update: {} to preserve existing flag states without data loss.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedFeatureFlags(prisma: PrismaClient): Promise<void> {
  for (const flag of SEED_FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: {
        key: flag.key,
        isEnabled: flag.isEnabled,
        description: flag.description,
      },
    });
  }
}
