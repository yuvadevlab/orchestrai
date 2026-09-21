/**
 * @file packages/events/src/lock/memory-distributed-lock.ts
 * @description Thread-safe, single-process in-memory implementation of IDistributedLock.
 */

import { createLogger } from "@orchestrai/logger";
import type { IDistributedLock, LockHandle } from "./distributed-lock.interface";
import { LockOptionsSchema, type LockOptions } from "./lock-options.schema";

/**
 * In-memory distributed lock provider for local execution and unit tests.
 */
export class MemoryDistributedLock implements IDistributedLock {
  /**
   * Internal logger instance.
   */
  private readonly logger = createLogger("MemoryDistributedLock");

  /**
   * Active locks stored by resource key.
   */
  private readonly locks = new Map<string, LockHandle>();

  /**
   * Attempts to acquire a lock on a resource.
   */
  public async acquire(
    resource: string,
    ownerId: string,
    options?: Partial<LockOptions>,
  ): Promise<LockHandle | null> {
    const opts = LockOptionsSchema.parse(options ?? {});
    const attempts = opts.retryCount + 1;

    for (let i = 0; i < attempts; i++) {
      const now = Date.now();
      const existing = this.locks.get(resource);

      // Guard clause: lock exists and has not expired
      if (existing && existing.expiresAt > now) {
        // Inline comment: Check if caller already holds this lock (re-entrant support)
        if (existing.ownerId === ownerId) {
          const reentrantHandle: LockHandle = {
            resource,
            ownerId,
            expiresAt: now + opts.ttlMs,
          };
          this.locks.set(resource, reentrantHandle);
          return reentrantHandle;
        }

        // Inline comment: Lock held by another owner; pause before retry attempt
        if (i < attempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, opts.retryDelayMs));
        }
        continue;
      }

      // Lock is free or expired — acquire atomically
      const handle: LockHandle = {
        resource,
        ownerId,
        expiresAt: now + opts.ttlMs,
      };

      this.locks.set(resource, handle);
      this.logger.debug(`Acquired in-memory lock on ${resource} (owner: ${ownerId})`);
      return handle;
    }

    this.logger.debug(`Failed to acquire in-memory lock on ${resource} after ${attempts} attempts`);
    return null;
  }

  /**
   * Releases an active lock if the handle's owner matches.
   */
  public async release(handle: LockHandle): Promise<boolean> {
    const existing = this.locks.get(handle.resource);

    // Guard clause: return false if lock does not exist
    if (!existing) {
      return false;
    }

    // Guard clause: check if ownership token matches
    if (existing.ownerId !== handle.ownerId) {
      // Inline comment: Owner mismatch, prevent unauthorized lock release
      this.logger.warn(
        `Unauthorized lock release attempt on ${handle.resource} by ${handle.ownerId}`,
      );
      return false;
    }

    this.locks.delete(handle.resource);
    this.logger.debug(`Released in-memory lock on ${handle.resource}`);
    return true;
  }

  /**
   * Extends lock expiration if owner matches.
   */
  public async extend(handle: LockHandle, extendMs: number): Promise<LockHandle | null> {
    const existing = this.locks.get(handle.resource);
    const now = Date.now();

    // Guard clause: missing or expired lock
    if (!existing || existing.expiresAt <= now) {
      return null;
    }

    // Guard clause: owner mismatch
    if (existing.ownerId !== handle.ownerId) {
      return null;
    }

    const updated: LockHandle = {
      ...existing,
      expiresAt: existing.expiresAt + extendMs,
    };

    this.locks.set(handle.resource, updated);
    return updated;
  }

  /**
   * Checks if resource is locked.
   */
  public async isLocked(resource: string): Promise<boolean> {
    const existing = this.locks.get(resource);

    // Guard clause: lock missing or expired
    if (!existing || existing.expiresAt <= Date.now()) {
      return false;
    }

    return true;
  }
}
