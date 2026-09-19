/**
 * @file packages/events/src/redis/redis-stream-serializer.ts
 * @description Serialization and deserialization utilities between DomainEventEnvelope and Redis Streams entry fields.
 */

import { type DomainEventEnvelope, DomainEventEnvelopeSchema } from "@orchestrai/core";

/**
 * Serializes a domain event envelope into a flat key-value string array suitable for `XADD`.
 *
 * Stores the envelope JSON string under the field "data" and includes metadata headers
 * ("eventType", "eventId", "executionId") to allow fast stream inspection without JSON parsing.
 *
 * @param event - The DomainEventEnvelope to serialize.
 * @returns Array of string arguments: `["data", json, "eventType", type, ...]`
 */
export function serializeStreamEvent(event: DomainEventEnvelope): string[] {
  const jsonPayload = JSON.stringify({
    ...event,
    timestamp: event.timestamp instanceof Date ? event.timestamp.toISOString() : event.timestamp,
  });

  return [
    "data",
    jsonPayload,
    "eventType",
    event.eventType,
    "eventId",
    event.eventId,
    "executionId",
    event.executionId,
  ];
}

/**
 * Parses raw Redis Stream key-value string fields back into a validated DomainEventEnvelope.
 *
 * @param fields - Raw string array of fields and values returned by Redis `XREAD` / `XREADGROUP`.
 * @returns Validated DomainEventEnvelope.
 */
export function deserializeStreamEvent(fields: string[]): DomainEventEnvelope {
  let rawJson: string | null = null;

  // Fields are returned as alternating keys and values: [key1, val1, key2, val2, ...]
  for (let i = 0; i < fields.length; i += 2) {
    if (fields[i] === "data") {
      rawJson = fields[i + 1] ?? null;
      break;
    }
  }

  if (!rawJson) {
    throw new Error("Invalid stream entry: missing 'data' field in stream payload");
  }

  const parsed = JSON.parse(rawJson);

  // Convert ISO timestamp string back into Date object
  if (typeof parsed.timestamp === "string") {
    parsed.timestamp = new Date(parsed.timestamp);
  }

  return DomainEventEnvelopeSchema.parse(parsed);
}
