/**
 * @file packages/events/src/idempotency/idempotency-store.interface.ts
 * @description Storage contract for idempotency key tracking and deduplication.
 */

import type { IdempotencyRecord } from "./idempotency-record.schema";

/**
 * Result returned when attempting to acquire an idempotency key.
 */
export interface AcquireKeyResult {
  /**
   * Whether the key was acquired for processing (true) or was already processed/in-flight (false).
   */
  acquired: boolean;

  /**
   * Existing record if the key was already locked, processed, or failed.
   */
  existingRecord?: IdempotencyRecord;
}

/**
 * Interface for idempotency storage backends.
 */
export interface IIdempotencyStore {
  /**
   * Attempts to acquire an idempotency key for processing.
   *
   * @param key - Unique idempotency key.
   * @param executionId - Execution ID performing the operation.
   * @param ttlMs - Time-to-live in milliseconds before record auto-expires.
   * @returns AcquireKeyResult indicating whether caller acquired lock or existing state.
   */
  acquireKey(key: string, executionId: string, ttlMs: number): Promise<AcquireKeyResult>;

  /**
   * Marks an idempotency key as successfully completed with an optional result payload.
   *
   * @param key - Idempotency key.
   * @param result - Optional result payload to store.
   */
  markCompleted(key: string, result?: unknown): Promise<void>;

  /**
   * Marks an idempotency key as failed with an error message.
   *
   * @param key - Idempotency key.
   * @param error - Error description or code.
   */
  markFailed(key: string, error: string): Promise<void>;

  /**
   * Retrieves an idempotency record by key.
   *
   * @param key - Idempotency key.
   * @returns IdempotencyRecord if found and not expired, null otherwise.
   */
  getRecord(key: string): Promise<IdempotencyRecord | null>;

  /**
   * Deletes expired idempotency records.
   *
   * @returns Number of records purged.
   */
  purgeExpired(): Promise<number>;
}
