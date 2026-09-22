/**
 * @file packages/events/src/lock/redis-distributed-lock.ts
 * @description Distributed Redis-backed lock implementation using atomic Lua scripts.
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { Redis } from "ioredis";
import type { IDistributedLock, LockHandle } from "./distributed-lock.interface";
import { LockOptionsSchema, type LockOptions } from "./lock-options.schema";

/**
 * Lua script for atomic lock release (releases only if ownerId matches stored value).
 */
const RELEASE_LUA_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

/**
 * Lua script for atomic TTL extension (extends only if ownerId matches stored value).
 */
const EXTEND_LUA_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
else
  return 0
end
`;

/**
 * Redis-backed distributed lock engine providing atomic mutual exclusion.
 */
export class RedisDistributedLock implements IDistributedLock {
  /**
   * Logger instance for lock events.
   */
  private readonly logger = loggerWithConfig(new Logger("RedisDistributedLock"));

  /**
   * Constructs a RedisDistributedLock instance.
   *
   * @param redis - Active ioredis client.
   * @param keyPrefix - Namespace prefix for Redis lock keys (default "orchestrai:lock:").
   */
  constructor(
    private readonly redis: Redis,
    private readonly keyPrefix: string = "orchestrai:lock:",
  ) {}

  /**
   * Formats a raw resource into a fully qualified Redis key.
   */
  private formatKey(resource: string): string {
    return `${this.keyPrefix}${resource}`;
  }

  /**
   * Attempts to acquire a distributed lock using Redis SET key value PX ttl NX.
   */
  public async acquire(
    resource: string,
    ownerId: string,
    options?: Partial<LockOptions>,
  ): Promise<LockHandle | null> {
    const opts = LockOptionsSchema.parse(options ?? {});
    const fullKey = this.formatKey(resource);
    const attempts = opts.retryCount + 1;

    for (let i = 0; i < attempts; i++) {
      const now = Date.now();
      const res = await this.redis.set(fullKey, ownerId, "PX", opts.ttlMs, "NX");

      // Guard clause: successfully acquired lock
      if (res === "OK") {
        this.logger.debug(`Acquired Redis lock on ${resource} (owner: ${ownerId})`);
        return {
          resource,
          ownerId,
          expiresAt: now + opts.ttlMs,
        };
      }

      // Inline comment: Delay before retrying lock acquisition
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, opts.retryDelayMs));
      }
    }

    this.logger.debug(`Failed to acquire Redis lock on ${resource} after ${attempts} attempts`);
    return null;
  }

  /**
   * Atomically releases a lock using a Lua script.
   */
  public async release(handle: LockHandle): Promise<boolean> {
    const fullKey = this.formatKey(handle.resource);
    const result = (await this.redis.eval(
      RELEASE_LUA_SCRIPT,
      1,
      fullKey,
      handle.ownerId,
    )) as number;

    // Inline comment: eval returns 1 if key was deleted, 0 if owner mismatched or key missing
    if (result === 1) {
      this.logger.debug(`Released Redis lock on ${handle.resource}`);
      return true;
    }

    return false;
  }

  /**
   * Atomically extends a lock using a Lua script.
   */
  public async extend(handle: LockHandle, extendMs: number): Promise<LockHandle | null> {
    const fullKey = this.formatKey(handle.resource);
    const remainingMs = Math.max(0, handle.expiresAt - Date.now()) + extendMs;

    const result = (await this.redis.eval(
      EXTEND_LUA_SCRIPT,
      1,
      fullKey,
      handle.ownerId,
      remainingMs,
    )) as number;

    // Guard clause: if lua script returned 0, lock lost or owner mismatch
    if (result === 0) {
      return null;
    }

    return {
      ...handle,
      expiresAt: Date.now() + remainingMs,
    };
  }

  /**
   * Checks if resource is locked in Redis.
   */
  public async isLocked(resource: string): Promise<boolean> {
    const fullKey = this.formatKey(resource);
    const exists = await this.redis.exists(fullKey);

    return exists === 1;
  }
}
