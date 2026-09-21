/**
 * @file packages/events/src/ordering/ordered-event.schema.ts
 * @description Zod schema for domain events enriched with vector clock causal ordering metadata.
 */

import { z } from "zod";

/**
 * Zod schema validating a VectorClock state map.
 */
export const VectorClockMapSchema = z.record(z.string(), z.number().int().nonnegative());

/**
 * Wrapper schema pairing an event with vector clock and sequence metadata.
 */
export const OrderedDomainEventSchema = z.object({
  /**
   * Node or agent ID that generated this event.
   */
  nodeId: z.string().min(1),

  /**
   * Monotonically increasing sequence number local to the producing node.
   */
  sequenceNumber: z.number().int().nonnegative(),

  /**
   * Vector clock snapshot at event emission time.
   */
  vectorClock: VectorClockMapSchema,

  /**
   * Underlying domain event payload.
   */
  event: z.object({
    eventId: z.string().uuid(),
    eventType: z.string(),
    executionId: z.string().uuid(),
    timestamp: z.string().datetime(),
    payload: z.record(z.string(), z.unknown()),
  }),
});

export type OrderedDomainEvent = z.infer<typeof OrderedDomainEventSchema>;
