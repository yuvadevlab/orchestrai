/**
 * @file packages/events/src/idempotency/memory-idempotency-store.ts
 * @description Thread-safe, in-memory implementation of IIdempotencyStore with automatic expiration.
 */

import { createLogger } from "@orchestrai/logger";
import type { IdempotencyRecord } from "./idempotency-record.schema";
import type { AcquireKeyResult, IIdempotencyStore } from "./idempotency-store.interface";

/**
 * In-memory idempotency storage engine for local process execution and testing.
 */
export class MemoryIdempotencyStore implements IIdempotencyStore {
  /**
   * Internal logger instance for idempotency operations.
   */
  private readonly logger = createLogger("MemoryIdempotencyStore");

  /**
   * Map storing active idempotency records indexed by key.
   */
  private readonly records = new Map<string, IdempotencyRecord>();

  /**
   * Attempts to acquire an idempotency key for processing.
   */
  public async acquireKey(
    key: string,
    executionId: string,
    ttlMs: number,
  ): Promise<AcquireKeyResult> {
    const now = Date.now();
    const existing = this.records.get(key);

    // Guard clause: check if an unexpired record already exists
    if (existing && existing.expiresAt > now) {
      // Inline comment: Log key conflict to aid debugging duplicate requests
      this.logger.debug(`Idempotency key hit: ${key} (status: ${existing.status})`);
      return {
        acquired: false,
        existingRecord: existing,
      };
    }

    // Create new idempotency record in PROCESSING state
    const record: IdempotencyRecord = {
      key,
      executionId,
      status: "PROCESSING",
      expiresAt: now + ttlMs,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    // Store the record atomically in memory
    this.records.set(key, record);
    this.logger.debug(`Acquired idempotency key: ${key}`);

    return {
      acquired: true,
      existingRecord: record,
    };
  }

  /**
   * Marks an idempotency key as COMPLETED.
   */
  public async markCompleted(key: string, result?: unknown): Promise<void> {
    const existing = this.records.get(key);

    // Guard clause: do nothing if key is missing or already expired
    if (!existing) {
      // Inline comment: Key may have expired during long execution, log warning
      this.logger.warn(`Cannot mark missing key as completed: ${key}`);
      return;
    }

    const now = new Date().toISOString();
    this.records.set(key, {
      ...existing,
      status: "COMPLETED",
      result,
      updatedAt: now,
    });
    this.logger.debug(`Marked idempotency key completed: ${key}`);
  }

  /**
   * Marks an idempotency key as FAILED.
   */
  public async markFailed(key: string, error: string): Promise<void> {
    const existing = this.records.get(key);

    // Guard clause: return early if key does not exist
    if (!existing) {
      // Inline comment: Ignore missing key failure transition
      return;
    }

    const now = new Date().toISOString();
    this.records.set(key, {
      ...existing,
      status: "FAILED",
      error,
      updatedAt: now,
    });
    this.logger.debug(`Marked idempotency key failed: ${key}`);
  }

  /**
   * Retrieves an active idempotency record by key.
   */
  public async getRecord(key: string): Promise<IdempotencyRecord | null> {
    const existing = this.records.get(key);

    // Guard clause: return null if record is missing
    if (!existing) {
      return null;
    }

    // Guard clause: purge and return null if record has expired
    if (existing.expiresAt <= Date.now()) {
      // Inline comment: Lazy expiration cleanup on read access
      this.records.delete(key);
      return null;
    }

    return existing;
  }

  /**
   * Purges all expired idempotency records.
   */
  public async purgeExpired(): Promise<number> {
    const now = Date.now();
    let purgedCount = 0;

    for (const [key, record] of this.records.entries()) {
      // Inline comment: Evaluate expiration timestamp against current clock
      if (record.expiresAt <= now) {
        this.records.delete(key);
        purgedCount++;
      }
    }

    // Inline comment: Log purge stats if any records were removed
    if (purgedCount > 0) {
      this.logger.debug(`Purged ${purgedCount} expired idempotency records`);
    }

    return purgedCount;
  }
}
