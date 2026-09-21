/**
 * @file packages/events/src/idempotency/idempotency-record.schema.ts
 * @description Zod schema definitions for idempotency tracking records.
 */

import { z } from "zod";

/**
 * Lifecycle status of an idempotent operation.
 */
export const IdempotencyStatusSchema = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export type IdempotencyStatus = z.infer<typeof IdempotencyStatusSchema>;

/**
 * Schema representing an idempotency tracking record for deduplication.
 */
export const IdempotencyRecordSchema = z.object({
  /**
   * Unique idempotency key identifying the request or event.
   */
  key: z.string().min(1),

  /**
   * Execution or payload identifier associated with this request.
   */
  executionId: z.string().uuid(),

  /**
   * Current lifecycle status of the operation.
   */
  status: IdempotencyStatusSchema,

  /**
   * Serialized result of the operation if successfully completed.
   */
  result: z.unknown().optional(),

  /**
   * Error message or code if the operation failed.
   */
  error: z.string().optional(),

  /**
   * Epoch timestamp in milliseconds when this record expires.
   */
  expiresAt: z.number().int().positive(),

  /**
   * ISO 8601 creation timestamp.
   */
  createdAt: z.string().datetime(),

  /**
   * ISO 8601 last update timestamp.
   */
  updatedAt: z.string().datetime(),
});

export type IdempotencyRecord = z.infer<typeof IdempotencyRecordSchema>;
