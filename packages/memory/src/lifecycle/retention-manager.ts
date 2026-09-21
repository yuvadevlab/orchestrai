/**
 * @file packages/memory/src/lifecycle/retention-manager.ts
 * @description Manages retention periods and automatic pruning for different memory tiers.
 */

import { MemoryType } from "@orchestrai/shared-types";
import type { IMemoryStorage } from "@/contracts";

/**
 * Time-to-live policies per memory classification in milliseconds.
 * Undefined represents indefinite / permanent retention.
 */
export type RetentionPolicyMap = Partial<Record<MemoryType, number | undefined>>;

/**
 * Standard default retention durations.
 */
export const DEFAULT_RETENTION_POLICIES: RetentionPolicyMap = {
  [MemoryType.WORKING]: 24 * 60 * 60 * 1000, // 24 hours
  [MemoryType.CONVERSATION]: 30 * 24 * 60 * 60 * 1000, // 30 days
  [MemoryType.EPISODIC]: 90 * 24 * 60 * 60 * 1000, // 90 days
  [MemoryType.TASK]: 14 * 24 * 60 * 60 * 1000, // 14 days
  [MemoryType.USER_PREFERENCE]: undefined, // Permanent
  [MemoryType.FACT]: undefined, // Permanent
  [MemoryType.SYSTEM]: undefined, // Permanent
};

/**
 * Coordinates memory expiration dates and executes scheduled cleanup sweeps.
 */
export class RetentionManager {
  private readonly storage: IMemoryStorage;
  private readonly policies: RetentionPolicyMap;

  constructor(storage: IMemoryStorage, customPolicies?: RetentionPolicyMap) {
    this.storage = storage;
    this.policies = { ...DEFAULT_RETENTION_POLICIES, ...customPolicies };
  }

  /**
   * Calculates the expiration ISO string for a given memory type.
   *
   * @param type - MemoryType of the item being stored.
   * @param baseTime - Reference creation timestamp (defaults to now).
   * @returns ISO string of expiration timestamp or undefined if permanent.
   */
  public calculateExpiration(type: MemoryType, baseTime: Date = new Date()): string | undefined {
    const ttlMs = this.policies[type];
    // Guard: Permanent retention if no TTL specified
    if (ttlMs === undefined) {
      return undefined;
    }

    return new Date(baseTime.getTime() + ttlMs).toISOString();
  }

  /**
   * Triggers an immediate purge of all expired memory items from the storage backend.
   *
   * @returns Total number of records deleted.
   */
  public async pruneExpiredMemories(): Promise<number> {
    return this.storage.pruneExpired();
  }
}
