/**
 * @file packages/observability/src/logging/log-context-enricher.ts
 * @description Injects active correlation context (traceId, spanId) and redacts secrets from log entries.
 */

import { getCorrelationContext } from "@/context";
import { redactSensitiveData } from "./sensitive-data-redactor";

export interface EnrichedLogPayload {
  message: string;
  traceId?: string;
  spanId?: string;
  executionId?: string;
  tenantId?: string;
  userId?: string;
  correlationId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Merges ambient correlation context into a structured log entry and sanitizes sensitive data.
 *
 * @param message - Primary log event message
 * @param metadata - Additional structured contextual data
 * @returns Fully enriched and redacted log payload
 */
export function enrichLogRecord(
  message: string,
  metadata: Record<string, unknown> = {},
): EnrichedLogPayload {
  const currentCtx = getCorrelationContext();
  const sanitizedMeta = redactSensitiveData(metadata) as Record<string, unknown>;

  return {
    message,
    traceId: currentCtx.traceId,
    spanId: currentCtx.spanId,
    executionId: currentCtx.executionId,
    tenantId: currentCtx.tenantId,
    userId: currentCtx.userId,
    correlationId: currentCtx.correlationId,
    context: sanitizedMeta,
    timestamp: new Date().toISOString(),
  };
}
