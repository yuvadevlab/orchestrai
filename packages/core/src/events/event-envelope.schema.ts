/**
 * @file packages/core/src/events/event-envelope.schema.ts
 * @description Standard transactional outbox and event bus envelope schema.
 */

import { z } from "zod";
import { ExecutionIdSchema, TenantIdSchema, TraceIdSchema, UuidSchema } from "@/identifiers";
import { DomainEventTypeSchema } from "./event-type.schema";

/**
 * Standard metadata envelope wrapping all domain events.
 * Guarantees cross-service traceability, event ordering, and idempotency.
 */
export const DomainEventEnvelopeSchema = z
  .object({
    eventId: UuidSchema.describe("Unique event occurrence UUID for deduplication"),
    eventType: DomainEventTypeSchema,
    executionId: ExecutionIdSchema,
    tenantId: TenantIdSchema,
    traceId: TraceIdSchema,
    timestamp: z.date().default(() => new Date()),
    payload: z
      .record(z.string(), z.unknown())
      .describe("Domain-specific event payload matching the eventType"),
  })
  .describe("Universal envelope for domain events transported via outbox, Redis, or Kafka");

export type DomainEventEnvelope = z.infer<typeof DomainEventEnvelopeSchema>;
