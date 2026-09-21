/**
 * @file packages/observability/src/context/correlation-context.ts
 * @description Asynchronous correlation context store powered by Node.js AsyncLocalStorage.
 */

import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Ambient telemetry and correlation attributes carried across asynchronous task boundaries.
 */
export interface CorrelationContext {
  /** 128-bit hexadecimal OpenTelemetry trace identifier (32 hex characters) */
  traceId?: string;
  /** 64-bit hexadecimal OpenTelemetry span identifier (16 hex characters) */
  spanId?: string;
  /** Current agent execution run identifier */
  executionId?: string;
  /** Multi-tenant isolation partition identifier */
  tenantId?: string;
  /** Identity identifier of the acting user or service */
  userId?: string;
  /** End-to-end client correlation trace identifier */
  correlationId?: string;
  /** OpenTelemetry W3C Baggage key-value pairs */
  baggage?: Record<string, string>;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

/**
 * Runs a function within the scope of an active CorrelationContext.
 *
 * @param context - Context attributes to bind
 * @param fn - Target function to execute
 * @returns Result of the executed function
 */
export function runWithContext<T>(context: CorrelationContext, fn: () => T): T {
  const current = storage.getStore() || {};
  const merged: CorrelationContext = {
    ...current,
    ...context,
    baggage: {
      ...current.baggage,
      ...context.baggage,
    },
  };
  return storage.run(merged, fn);
}

/**
 * Returns the currently active CorrelationContext, or empty object if outside a context scope.
 */
export function getCorrelationContext(): CorrelationContext {
  return storage.getStore() || {};
}

/**
 * Returns current trace ID or undefined.
 */
export function getTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}

/**
 * Returns current execution ID or undefined.
 */
export function getExecutionId(): string | undefined {
  return storage.getStore()?.executionId;
}

/**
 * Returns current tenant ID or undefined.
 */
export function getTenantId(): string | undefined {
  return storage.getStore()?.tenantId;
}
