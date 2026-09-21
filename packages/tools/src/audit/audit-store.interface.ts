/**
 * @file packages/tools/src/audit/audit-store.interface.ts
 * @description Abstract storage interface for persisting security audit events.
 */

import type { SecurityAuditEvent } from "./audit-event.schema";

/**
 * Contract for any audit event store implementation.
 * Decouples the logger from the underlying persistence backend.
 */
export interface IAuditStore {
  /**
   * Persist a single security audit event.
   * Must be fire-and-forget safe — a storage failure must never block tool execution.
   *
   * @param event - The audit event to persist.
   */
  append(event: SecurityAuditEvent): Promise<void>;

  /**
   * Retrieve audit events, optionally filtered by execution ID.
   *
   * @param executionId - If provided, return only events for this execution.
   * @param limit - Maximum number of events to return (most recent first).
   */
  query(executionId?: string, limit?: number): Promise<ReadonlyArray<SecurityAuditEvent>>;
}
