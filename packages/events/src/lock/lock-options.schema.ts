/**
 * @file packages/events/src/lock/lock-options.schema.ts
 * @description Configuration options and schemas for distributed lock acquisition.
 */

import { z } from "zod";

/**
 * Schema validating distributed lock acquisition options.
 */
export const LockOptionsSchema = z.object({
  /**
   * Time-to-live in milliseconds before lock automatically releases.
   */
  ttlMs: z.number().int().positive().default(10000),

  /**
   * Maximum retry attempts when lock acquisition fails initially.
   */
  retryCount: z.number().int().nonnegative().default(3),

  /**
   * Base delay in milliseconds between lock retry attempts.
   */
  retryDelayMs: z.number().int().positive().default(200),
});

export type LockOptions = z.infer<typeof LockOptionsSchema>;
