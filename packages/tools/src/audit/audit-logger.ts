/**
 * @file packages/tools/src/audit/audit-logger.ts
 * @description Structured security audit logger with in-memory store.
 *
 * ─── Non-Blocking Audit (Design Note) ────────────────────────────────
 * Audit log writes must never block tool execution. If the store fails,
 * we catch the error silently and fall through — a failed audit write
 * is preferable to a blocked tool invocation crashing the worker.
 * In production, use a durable store (PostgreSQL audit table) via IAuditStore.
 * ─────────────────────────────────────────────────────────────────────
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { SecurityAuditEvent } from "./audit-event.schema";
import type { IAuditStore } from "./audit-store.interface";

/** Package-scoped logger for security audit events */
const logger = loggerWithConfig(new Logger("Audit"));

/**
 * IAuditLogger is the interface SandboxExecutor depends on.
 * Keeping it as a simple interface allows swapping the backend store.
 */
export interface IAuditLogger {
  /**
   * Emit a security audit event.
   * Must never throw — failures are silently swallowed to prevent blocking.
   *
   * @param event - The security audit event payload (timestamp is auto-stamped if omitted).
   */
  log(event: Omit<SecurityAuditEvent, "timestamp">): Promise<void>;
}

/**
 * In-memory audit store — suitable for development and testing.
 * Stores events in a bounded ring buffer (defaults to last 1000 events).
 */
export class MemoryAuditStore implements IAuditStore {
  private readonly events: SecurityAuditEvent[] = [];

  constructor(private readonly maxSize: number = 1000) {}

  async append(event: SecurityAuditEvent): Promise<void> {
    this.events.push(event);
    // Evict oldest events when ring buffer is full
    if (this.events.length > this.maxSize) {
      this.events.shift();
    }
  }

  async query(executionId?: string, limit = 100): Promise<ReadonlyArray<SecurityAuditEvent>> {
    const filtered = executionId
      ? this.events.filter((e) => e.executionId === executionId)
      : [...this.events];
    // Return most recent first
    return filtered.reverse().slice(0, limit);
  }
}

/**
 * Concrete audit logger that writes structured events via `@yuva-devlab/logger`
 * and optionally persists them to an IAuditStore backend.
 */
export class AuditLogger implements IAuditLogger {
  constructor(private readonly store?: IAuditStore) {}

  /** {@inheritDoc IAuditLogger.log} */
  async log(event: Omit<SecurityAuditEvent, "timestamp">): Promise<void> {
    const stamped: SecurityAuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Log decision through the platform logger for structured output
    if (stamped.decision === "ALLOW") {
      logger.info(
        `ALLOW | agent=${stamped.agentId} tool=${stamped.toolId} op=${stamped.operation} | ${stamped.reason}`,
      );
    } else {
      logger.warn(
        `DENY  | agent=${stamped.agentId} tool=${stamped.toolId} op=${stamped.operation} | ${stamped.reason}`,
      );
    }

    // Persist to store — fire-and-forget, never throw
    if (this.store) {
      try {
        await this.store.append(stamped);
      } catch {
        // Intentionally silent — a store failure must not block tool execution
      }
    }
  }
}
