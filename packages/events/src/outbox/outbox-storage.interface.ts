/**
 * @file packages/events/src/outbox/outbox-storage.interface.ts
 * @description Interfaces and data types for Outbox pattern storage adapters.
 */

import type { DomainEventEnvelope } from "@orchestrai/core";

/**
 * Lifecycle status of an outbox record.
 */
export type OutboxStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

/**
 * Represents a single domain event queued in the transactional outbox.
 */
export interface OutboxRecord {
  /** Unique primary key identifier of the outbox record */
  readonly id: string;
  /** Domain event identifier matching envelope eventId */
  readonly eventId: string;
  /** Type discriminator of the domain event */
  readonly eventType: string;
  /** Orchestration execution identifier associated with the event */
  readonly executionId: string;
  /** Complete validated DomainEventEnvelope */
  readonly payload: DomainEventEnvelope;
  /** Current processing lifecycle state */
  readonly status: OutboxStatus;
  /** Number of failed publishing attempts so far */
  readonly retryCount: number;
  /** Maximum retry attempts before marking as permanently failed */
  readonly maxRetries: number;
  /** Error message recorded during the last failed attempt, if any */
  readonly lastError?: string;
  /** Timestamp when the record was initially created */
  readonly createdAt: Date;
  /** Timestamp when the record was successfully published */
  readonly publishedAt?: Date;
}

/**
 * Storage adapter interface for persisting and querying outbox events.
 */
export interface IOutboxStorage {
  /**
   * Enqueues a new event record into the outbox storage.
   *
   * @param record - Partial outbox record payload to insert.
   * @returns The newly created OutboxRecord.
   */
  insert(
    record: Pick<OutboxRecord, "eventId" | "eventType" | "executionId" | "payload"> &
      Partial<Pick<OutboxRecord, "maxRetries">>,
  ): Promise<OutboxRecord>;

  /**
   * Atomically claims a batch of pending or retryable records, transitioning their status to PROCESSING.
   *
   * @param batchSize - Maximum number of records to claim in a single sweep.
   * @returns Array of claimed OutboxRecords.
   */
  claimPendingBatch(batchSize: number): Promise<OutboxRecord[]>;

  /**
   * Marks a previously claimed record as successfully published.
   *
   * @param id - The ID of the outbox record.
   */
  markPublished(id: string): Promise<void>;

  /**
   * Records a publishing error and increments retryCount, moving to FAILED if maxRetries exceeded.
   *
   * @param id - The ID of the outbox record.
   * @param error - The error message to record.
   */
  recordFailure(id: string, error: string): Promise<void>;

  /**
   * Retrieves a single outbox record by its ID.
   *
   * @param id - The ID of the outbox record.
   */
  getRecord(id: string): Promise<OutboxRecord | null>;
}
