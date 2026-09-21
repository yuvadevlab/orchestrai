/**
 * @file packages/events/src/lock/distributed-lock.interface.ts
 * @description Contract for distributed locking mechanisms.
 */

import type { LockOptions } from "./lock-options.schema";

/**
 * Handle returned when a distributed lock is successfully acquired.
 */
export interface LockHandle {
  /**
   * Resource key being locked.
   */
  resource: string;

  /**
   * Unique lock ownership token (UUID / randomly generated).
   */
  ownerId: string;

  /**
   * Timestamp in milliseconds when lock expires.
   */
  expiresAt: number;
}

/**
 * Interface defining distributed lock contracts.
 */
export interface IDistributedLock {
  /**
   * Attempts to acquire a distributed lock on a resource.
   *
   * @param resource - Resource identifier to lock.
   * @param ownerId - Unique identifier of caller acquiring lock.
   * @param options - Lock options (ttl, retries, delay).
   * @returns LockHandle if lock acquired, null if acquisition failed.
   */
  acquire(
    resource: string,
    ownerId: string,
    options?: Partial<LockOptions>,
  ): Promise<LockHandle | null>;

  /**
   * Releases a previously acquired lock if the owner matches.
   *
   * @param handle - LockHandle returned during acquisition.
   * @returns True if lock was released, false if lock was missing or owned by another.
   */
  release(handle: LockHandle): Promise<boolean>;

  /**
   * Extends the TTL of an active lock if caller holds ownership.
   *
   * @param handle - Active LockHandle.
   * @param extendMs - Additional milliseconds to add to TTL.
   * @returns Updated LockHandle if extended, null if lock expired or owner mismatch.
   */
  extend(handle: LockHandle, extendMs: number): Promise<LockHandle | null>;

  /**
   * Checks whether a resource is currently locked.
   *
   * @param resource - Resource key.
   * @returns True if locked, false otherwise.
   */
  isLocked(resource: string): Promise<boolean>;
}
