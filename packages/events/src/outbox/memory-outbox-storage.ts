/**
 * @file packages/events/src/outbox/memory-outbox-storage.ts
 * @description In-memory implementation of IOutboxStorage for local development and unit tests.
 */

import { randomUUID } from "node:crypto";
import type { IOutboxStorage, OutboxRecord } from "./outbox-storage.interface";

/**
 * In-memory adapter for the Outbox pattern with transactional status updates.
 */
export class MemoryOutboxStorage implements IOutboxStorage {
  private readonly records = new Map<string, OutboxRecord>();

  /**
   * Enqueues a new event record into the in-memory map.
   *
   * @param record - Partial outbox record payload to insert.
   * @returns The newly created OutboxRecord.
   */
  public async insert(
    record: Pick<OutboxRecord, "eventId" | "eventType" | "executionId" | "payload"> &
      Partial<Pick<OutboxRecord, "maxRetries">>,
  ): Promise<OutboxRecord> {
    const id = randomUUID();
    const newRecord: OutboxRecord = {
      id,
      eventId: record.eventId,
      eventType: record.eventType,
      executionId: record.executionId,
      payload: record.payload,
      status: "PENDING",
      retryCount: 0,
      maxRetries: record.maxRetries ?? 3,
      createdAt: new Date(),
    };

    this.records.set(id, newRecord);
    return newRecord;
  }

  /**
   * Atomically claims up to `batchSize` pending records, transitioning them to PROCESSING.
   *
   * @param batchSize - Maximum number of records to claim.
   * @returns Array of claimed OutboxRecords.
   */
  public async claimPendingBatch(batchSize: number): Promise<OutboxRecord[]> {
    const claimed: OutboxRecord[] = [];

    // Sweep records in insertion order
    for (const record of this.records.values()) {
      // Guard: Only claim records that are currently PENDING
      if (record.status !== "PENDING") {
        continue;
      }

      // Guard: Check if batchSize limit reached
      if (claimed.length >= batchSize) {
        break;
      }

      // Transition status to PROCESSING
      const updated: OutboxRecord = {
        ...record,
        status: "PROCESSING",
      };

      this.records.set(record.id, updated);
      claimed.push(updated);
    }

    return claimed;
  }

  /**
   * Marks a record as PUBLISHED and records the publishing timestamp.
   *
   * @param id - The ID of the outbox record.
   */
  public async markPublished(id: string): Promise<void> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new Error(`Outbox record not found: ${id}`);
    }

    this.records.set(id, {
      ...existing,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
  }

  /**
   * Records a failed publishing attempt. Transitions to FAILED if max retries exceeded,
   * otherwise resets status back to PENDING for the next polling cycle.
   *
   * @param id - The ID of the outbox record.
   * @param error - The failure error message.
   */
  public async recordFailure(id: string, error: string): Promise<void> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new Error(`Outbox record not found: ${id}`);
    }

    const nextRetryCount = existing.retryCount + 1;
    // Check if retries have exhausted the configured ceiling
    const isExhausted = nextRetryCount >= existing.maxRetries;

    this.records.set(id, {
      ...existing,
      retryCount: nextRetryCount,
      lastError: error,
      // If retries exhausted, permanently fail; else reset to PENDING for retry
      status: isExhausted ? "FAILED" : "PENDING",
    });
  }

  /**
   * Retrieves an outbox record by its identifier.
   *
   * @param id - The ID of the outbox record.
   * @returns OutboxRecord or null if not present.
   */
  public async getRecord(id: string): Promise<OutboxRecord | null> {
    return this.records.get(id) ?? null;
  }

  /**
   * Clears all in-memory records (useful for test tear-down).
   */
  public clear(): void {
    this.records.clear();
  }

  /**
   * Returns total count of records in the store.
   */
  public count(): number {
    return this.records.size;
  }
}
