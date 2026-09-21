/**
 * @file packages/tools/src/audit/audit-event.schema.ts
 * @description Zod schema and type for structured security audit events.
 *
 * ─── Why Always Audit? (Design Note) ─────────────────────────────────
 * Security systems must produce a complete, tamper-evident trail of every
 * security decision — both ALLOW and DENY. Auditing only failures hides
 * information needed for forensics (e.g. "which tools did this compromised
 * agent successfully call before we detected it?").
 * ─────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";

/**
 * Zod schema for a single security audit event emitted by SandboxExecutor.
 */
export const SecurityAuditEventSchema = z.object({
  /** Unique identifier of the agent that attempted the operation */
  agentId: z.string(),
  /** Tenant scope for multi-tenant isolation */
  tenantId: z.string(),
  /** Execution trace correlation identifier */
  executionId: z.string(),
  /** The tool that was targeted (e.g. "read_file", "bash") */
  toolId: z.string(),
  /** The operation class attempted (e.g. "execute", "read", "write") */
  operation: z.string(),
  /** The security decision made */
  decision: z.enum(["ALLOW", "DENY"]),
  /** Human-readable reason for the decision (rule ID, quota message, etc.) */
  reason: z.string(),
  /** ISO 8601 timestamp of when the decision was made */
  timestamp: z.string().datetime().optional(),
  /** Optional W3C trace ID for distributed tracing correlation */
  traceId: z.string().optional(),
});

/** Inferred TypeScript type from the Zod schema */
export type SecurityAuditEvent = z.infer<typeof SecurityAuditEventSchema>;
