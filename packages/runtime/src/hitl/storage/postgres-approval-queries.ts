/**
 * @file packages/runtime/src/hitl/storage/postgres-approval-queries.ts
 * @description Centralized SQL query catalog and typed row interfaces for HITL approval storage.
 * @module @orchestrai/runtime/hitl
 */

import { ApprovalStatus } from "@orchestrai/shared-types";

/**
 * Raw database record structure returned from `approvals` table queries.
 */
export interface ApprovalDbRow {
  approval_id: string;
  execution_id: string;
  step_id: string | null;
  tool_name: string;
  tool_arguments: string | Record<string, unknown>;
  risk_level: string;
  rationale: string;
  status: ApprovalStatus;
  operator_id?: string;
  rejection_reason?: string;
  modified_arguments?: string | Record<string, unknown>;
  requested_at: Date;
  expires_at: Date;
  decided_at?: Date;
}

/**
 * Master catalog of static SQL queries for HITL approval tickets.
 */
export const APPROVAL_SQL_QUERIES = {
  /**
   * Inserts an approval ticket awaiting human operator clearance.
   */
  CREATE_TICKET: `
    INSERT INTO approvals (
      approval_id, execution_id, step_id, tool_name,
      tool_arguments, rationale, status, requested_at, expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
  `,

  /**
   * Retrieves an approval ticket by its primary key UUID.
   */
  GET_TICKET_BY_ID: `
    SELECT *
    FROM approvals
    WHERE approval_id = $1
    LIMIT 1;
  `,

  /**
   * Lists all PENDING tickets, optionally filtered by execution ID.
   */
  LIST_PENDING: `
    SELECT *
    FROM approvals
    WHERE status = '${ApprovalStatus.PENDING}'
      AND ($1::uuid IS NULL OR execution_id = $1::uuid)
    ORDER BY requested_at ASC;
  `,

  /**
   * Resolves a ticket using optimistic locking on PENDING status.
   */
  RESOLVE_TICKET: `
    UPDATE approvals
    SET
      status = $1,
      operator_id = $2,
      rejection_reason = $3,
      modified_arguments = $4,
      decided_at = $5
    WHERE approval_id = $6 AND status = '${ApprovalStatus.PENDING}'
    RETURNING *;
  `,

  /**
   * Transitions expired pending tickets to TIMED_OUT status.
   */
  EXPIRE_STALE_TICKETS: `
    UPDATE approvals
    SET
      status = '${ApprovalStatus.TIMED_OUT}',
      rejection_reason = 'Approval window expired without human response',
      decided_at = $1
    WHERE status = '${ApprovalStatus.PENDING}' AND expires_at < $1;
  `,
} as const;
