/**
 * @file apps/gateway/src/modules/platform/services/feature-flag.service.ts
 * @description Real-time feature flag, circuit breaker, and emergency kill switch service.
 * Enables sub-second deactivation of sensitive capabilities or system maintenance.
 * @module apps/gateway/modules/platform/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import { FeatureFlagKey } from "@orchestrai/shared-types";

export interface FeatureFlagRecord {
  flagId: string;
  key: string;
  isEnabled: boolean;
  description: string | null;
}

/**
 * Service managing real-time feature flags and emergency kill switches.
 */
export class FeatureFlagService {
  private cache: Map<string, boolean> = new Map();
  private lastFetchedAt: number = 0;
  private readonly CACHE_TTL_MS = 5_000; // 5-second responsive cache for kill switches

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Checks whether a feature flag is enabled.
   *
   * @param key - Canonical FeatureFlagKey enum (e.g. FeatureFlagKey.KILL_SWITCH_BASH_TOOL)
   * @param fallback - Default state if not found in database (default: true)
   */
  public async isEnabled(key: FeatureFlagKey | string, fallback: boolean = true): Promise<boolean> {
    const now = Date.now();
    if (this.cache.has(key) && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.cache.get(key) ?? fallback;
    }

    try {
      const record = await this.db.featureFlag.findUnique({
        where: { key },
      });

      if (record) {
        this.cache.set(key, record.isEnabled);
        this.lastFetchedAt = now;
        return record.isEnabled;
      }
    } catch {
      // Database read fallback
    }

    return fallback;
  }

  /**
   * Updates or sets a feature flag state.
   */
  public async setFlag(
    key: FeatureFlagKey | string,
    isEnabled: boolean,
    description?: string,
  ): Promise<void> {
    this.cache.set(key, isEnabled);
    this.lastFetchedAt = Date.now();

    await this.db.featureFlag.upsert({
      where: { key },
      update: {
        isEnabled,
        ...(description && { description }),
      },
      create: {
        key,
        isEnabled,
        description: description ?? `Feature flag ${key}`,
      },
    });
  }

  /**
   * Lists all configured feature flags.
   */
  public async listFlags(): Promise<FeatureFlagRecord[]> {
    try {
      const records = await this.db.featureFlag.findMany({
        orderBy: { key: "asc" },
      });
      return records as FeatureFlagRecord[];
    } catch {
      return [];
    }
  }
}

export const featureFlagService = new FeatureFlagService();
