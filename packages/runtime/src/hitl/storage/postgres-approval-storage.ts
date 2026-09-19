/**
 * @file packages/runtime/src/hitl/storage/postgres-approval-storage.ts
 * @description Durable PostgreSQL adapter for HITL approvals table with optimistic concurrency control.
 */

import { ApprovalStatus } from "@orchestrai/shared-types";
import { OrchestrAIError } from "@orchestrai/core";
import type { IDatabaseQueryRunner } from "@/checkpoint/database-adapter.interface";
import type { ApprovalResolutionInput, ApprovalTicket, IApprovalStorage } from "../contracts";

/**
 * Raw database row shape returned from the `approvals` relational table.
 */
interface ApprovalDbRow {
  readonly approval_id: string;
  readonly execution_id: string;
  readonly step_id?: string;
  readonly tool_name: string;
  readonly tool_arguments: string | Record<string, unknown>;
  readonly rationale: string;
  readonly status: string;
  readonly operator_id?: string;
  readonly rejection_reason?: string;
  readonly modified_arguments?: string | Record<string, unknown>;
  readonly requested_at: Date | string;
  readonly expires_at: Date | string;
  readonly decided_at?: Date | string;
}

/**
 * PostgreSQL-backed storage adapter for HITL approval tickets.
 */
export class PostgresApprovalStorage implements IApprovalStorage {
  private readonly db: IDatabaseQueryRunner;

  public constructor(db: IDatabaseQueryRunner) {
    this.db = db;
  }

  /**
   * Persists an approval ticket into the approvals table.
   */
  public async createTicket(ticket: ApprovalTicket): Promise<ApprovalTicket> {
    const sql = `
      INSERT INTO approvals (
        approval_id, execution_id, step_id, tool_name,
        tool_arguments, rationale, status, requested_at, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;

    await this.db.query(sql, [
      ticket.approvalId,
      ticket.executionId,
      ticket.stepId ?? null,
      ticket.toolName,
      JSON.stringify(ticket.toolArguments),
      ticket.rationale,
      ticket.status,
      ticket.requestedAt,
      ticket.expiresAt,
    ]);

    return ticket;
  }

  /**
   * Retrieves an approval ticket by its primary key UUID.
   */
  public async getTicket(approvalId: string): Promise<ApprovalTicket | undefined> {
    const sql = `
      SELECT *
      FROM approvals
      WHERE approval_id = $1
      LIMIT 1;
    `;

    const rows = await this.db.query<ApprovalDbRow>(sql, [approvalId]);
    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return this.mapRowToTicket(row);
  }

  /**
   * Lists all PENDING tickets, optionally filtered by execution ID.
   */
  public async listPending(executionId?: string): Promise<readonly ApprovalTicket[]> {
    const sql = `
      SELECT *
      FROM approvals
      WHERE status = 'PENDING'
        AND ($1::uuid IS NULL OR execution_id = $1::uuid)
      ORDER BY requested_at ASC;
    `;

    const rows = await this.db.query<ApprovalDbRow>(sql, [executionId ?? null]);
    return rows.map((r) => this.mapRowToTicket(r));
  }

  /**
   * Resolves a ticket using optimistic locking to prevent concurrent resolution races.
   */
  public async resolveTicket(
    approvalId: string,
    resolution: ApprovalResolutionInput,
  ): Promise<ApprovalTicket> {
    // Invariant: Approvals table check constraint restricts status to PENDING, APPROVED, REJECTED, TIMED_OUT
    const nextStatus =
      resolution.decision === "APPROVED" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    const rejectionReason =
      resolution.reason ??
      (resolution.decision === "CANCELLED" ? "Execution cancelled by operator" : null);

    const decidedAt = new Date();
    const modifiedArgsJson = resolution.modifiedArguments
      ? JSON.stringify(resolution.modifiedArguments)
      : null;

    const sql = `
      UPDATE approvals
      SET
        status = $1,
        operator_id = $2,
        rejection_reason = $3,
        modified_arguments = $4,
        decided_at = $5
      WHERE approval_id = $6 AND status = 'PENDING'
      RETURNING *;
    `;

    const rows = await this.db.query<ApprovalDbRow>(sql, [
      nextStatus,
      resolution.operatorId,
      rejectionReason,
      modifiedArgsJson,
      decidedAt,
      approvalId,
    ]);

    const updatedRow = rows[0];
    if (updatedRow) {
      return this.mapRowToTicket(updatedRow);
    }

    // If 0 rows updated, verify whether ticket doesn't exist or was already decided
    const existing = await this.getTicket(approvalId);
    if (!existing) {
      throw new OrchestrAIError(`Approval ticket "${approvalId}" not found`, "NOT_FOUND", 404, {
        approvalId,
      });
    }

    throw new OrchestrAIError(
      `Cannot resolve ticket "${approvalId}": already in status "${existing.status}"`,
      "VALIDATION_ERROR",
      400,
      { approvalId, status: existing.status },
    );
  }

  /**
   * Sweeps and transitions expired pending tickets to TIMED_OUT.
   */
  public async expireStaleTickets(now = new Date()): Promise<number> {
    const sql = `
      UPDATE approvals
      SET
        status = 'TIMED_OUT',
        rejection_reason = 'Approval window expired without human response',
        decided_at = $1
      WHERE status = 'PENDING' AND expires_at < $1;
    `;

    const result = await this.db.query<{ count?: number }>(sql, [now]);
    return result.length;
  }

  /**
   * Maps a database row to a validated ApprovalTicket object.
   */
  private mapRowToTicket(row: ApprovalDbRow): ApprovalTicket {
    const toolArgs =
      typeof row.tool_arguments === "string"
        ? (JSON.parse(row.tool_arguments) as Record<string, unknown>)
        : (row.tool_arguments as Record<string, unknown>);

    const modifiedArgs = row.modified_arguments
      ? typeof row.modified_arguments === "string"
        ? (JSON.parse(row.modified_arguments) as Record<string, unknown>)
        : (row.modified_arguments as Record<string, unknown>)
      : undefined;

    return {
      approvalId: row.approval_id,
      executionId: row.execution_id,
      stepId: row.step_id,
      stepIndex: 0,
      toolName: row.tool_name,
      toolArguments: toolArgs,
      riskLevel: "HIGH",
      rationale: row.rationale,
      status: row.status as ApprovalStatus,
      operatorId: row.operator_id,
      rejectionReason: row.rejection_reason,
      modifiedArguments: modifiedArgs,
      requestedAt: row.requested_at instanceof Date ? row.requested_at : new Date(row.requested_at),
      expiresAt: row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at),
      decidedAt: row.decided_at
        ? row.decided_at instanceof Date
          ? row.decided_at
          : new Date(row.decided_at)
        : undefined,
    };
  }
}
