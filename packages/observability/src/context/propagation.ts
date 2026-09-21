/**
 * @file packages/observability/src/context/propagation.ts
 * @description W3C TraceContext header parser and serializer for distributed trace propagation.
 */

import { randomBytes } from "node:crypto";
import type { CorrelationContext } from "./correlation-context";

export const W3C_TRACEPARENT_HEADER = "traceparent";
export const W3C_TRACESTATE_HEADER = "tracestate";
export const W3C_BAGGAGE_HEADER = "baggage";

/**
 * Generates a 128-bit random hex string (32 characters) for OpenTelemetry trace IDs.
 */
export function generateTraceId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Generates a 64-bit random hex string (16 characters) for OpenTelemetry span IDs.
 */
export function generateSpanId(): string {
  return randomBytes(8).toString("hex");
}

/**
 * Extracts W3C TraceContext and Baggage from inbound HTTP headers.
 *
 * @param headers - Inbound HTTP header map
 * @returns Parsed CorrelationContext attributes
 */
export function extractTraceContext(
  headers: Record<string, string | string[] | undefined>,
): CorrelationContext {
  const result: CorrelationContext = {};

  const rawTraceparent = headers[W3C_TRACEPARENT_HEADER];
  const traceparent = Array.isArray(rawTraceparent) ? rawTraceparent[0] : rawTraceparent;

  if (traceparent && typeof traceparent === "string") {
    // Expected format: 00-${traceId}-${spanId}-${traceFlags}
    const parts = traceparent.trim().split("-");
    if (parts.length >= 4 && parts[0] === "00") {
      const traceId = parts[1];
      const spanId = parts[2];
      if (traceId && traceId.length === 32 && spanId && spanId.length === 16) {
        result.traceId = traceId;
        result.spanId = spanId;
      }
    }
  }

  // Fallback to legacy correlation headers if traceparent not present
  if (!result.traceId) {
    const rawReqId = headers["x-request-id"] || headers["x-correlation-id"];
    const reqId = Array.isArray(rawReqId) ? rawReqId[0] : rawReqId;
    if (reqId) {
      result.correlationId = reqId;
    }
  }

  const rawTenantId = headers["x-tenant-id"];
  const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;
  if (tenantId) {
    result.tenantId = tenantId;
  }

  return result;
}

/**
 * Injects current CorrelationContext into an outbound HTTP header map.
 *
 * @param context - Context to propagate
 * @param headers - Target header map to mutate
 */
export function injectTraceContext(
  context: CorrelationContext,
  headers: Record<string, string>,
): void {
  if (context.traceId && context.spanId) {
    headers[W3C_TRACEPARENT_HEADER] = `00-${context.traceId}-${context.spanId}-01`;
  }

  if (context.tenantId) {
    headers["x-tenant-id"] = context.tenantId;
  }

  if (context.correlationId) {
    headers["x-correlation-id"] = context.correlationId;
  }
}
