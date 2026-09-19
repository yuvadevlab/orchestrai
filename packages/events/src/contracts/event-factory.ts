/**
 * @file packages/events/src/contracts/event-factory.ts
 * @description Factory utilities for instantiating validated DomainEventEnvelope instances.
 */

import { randomUUID } from "node:crypto";
import {
  type DomainEventEnvelope,
  DomainEventEnvelopeSchema,
  type ExecutionId,
  type TenantId,
  type TraceId,
} from "@orchestrai/core";
import type { DomainEventType } from "@orchestrai/shared-types";
import { EventPayloadMap, type EventPayloadTypeMap } from "./event-payloads";

/**
 * Parameters required to assemble a domain event envelope.
 */
export interface CreateEventParams<TType extends DomainEventType> {
  eventType: TType;
  executionId: ExecutionId;
  tenantId?: TenantId;
  traceId?: TraceId;
  payload: EventPayloadTypeMap[TType];
  timestamp?: Date;
}

/**
 * Creates and validates a strongly typed `DomainEventEnvelope`.
 *
 * Automatically provisions an event UUID and defaults tenant/trace IDs if omitted.
 *
 * @param params - Configuration parameters and typed payload.
 * @returns Fully validated DomainEventEnvelope.
 */
export function createDomainEvent<TType extends DomainEventType>(
  params: CreateEventParams<TType>,
): DomainEventEnvelope {
  // Validate the inner payload against its specific schema first
  const payloadSchema = EventPayloadMap[params.eventType];
  const validatedPayload = payloadSchema.parse(params.payload) as Record<string, unknown>;

  // Build the outer envelope conforming to DomainEventEnvelopeSchema
  const envelope: DomainEventEnvelope = {
    eventId: randomUUID(),
    eventType: params.eventType,
    executionId: params.executionId,
    tenantId: params.tenantId ?? "00000000-0000-0000-0000-000000000000",
    traceId: params.traceId ?? `tr_${randomUUID().slice(0, 8)}`,
    timestamp: params.timestamp ?? new Date(),
    payload: validatedPayload,
  };

  // Perform root schema invariant check
  return DomainEventEnvelopeSchema.parse(envelope);
}
