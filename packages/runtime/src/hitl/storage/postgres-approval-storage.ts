/**
 * @file packages/runtime/src/hitl/storage/postgres-approval-storage.ts
 * @description Durable PostgreSQL adapter for HITL approvals table with optimistic concurrency control.
 */

import { ApprovalStatus, ApprovalDecisionVerdict, ErrorCode } from "@orchestrai/shared-types";
import { OrchestrAIError } from "@orchestrai/core";
import type { IDatabaseQueryRunner } from "@/checkpoint/database-adapter.interface";
import type { ApprovalResolutionInput, ApprovalTicket, IApprovalStorage } from "../contracts";
import { APPROVAL_SQL_QUERIES, type ApprovalDbRow } from "./postgres-approval-queries";

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
    await this.db.query(APPROVAL_SQL_QUERIES.CREATE_TICKET, [
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
    const rows = await this.db.query<ApprovalDbRow>(APPROVAL_SQL_QUERIES.GET_TICKET_BY_ID, [
      approvalId,
    ]);
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
    const rows = await this.db.query<ApprovalDbRow>(APPROVAL_SQL_QUERIES.LIST_PENDING, [
      executionId ?? null,
    ]);
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
      resolution.decision === ApprovalDecisionVerdict.APPROVED
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.REJECTED;

    const rejectionReason =
      resolution.reason ??
      (resolution.decision === ApprovalDecisionVerdict.CANCELLED
        ? "Execution cancelled by operator"
        : null);

    const decidedAt = new Date();
    const modifiedArgsJson = resolution.modifiedArguments
      ? JSON.stringify(resolution.modifiedArguments)
      : null;

    const rows = await this.db.query<ApprovalDbRow>(APPROVAL_SQL_QUERIES.RESOLVE_TICKET, [
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
      throw new OrchestrAIError(
        `Approval ticket "${approvalId}" not found`,
        ErrorCode.NOT_FOUND,
        404,
        {
          approvalId,
        },
      );
    }

    throw new OrchestrAIError(
      `Cannot resolve ticket "${approvalId}": already in status "${existing.status}"`,
      ErrorCode.VALIDATION_ERROR,
      400,
      { approvalId, status: existing.status },
    );
  }

  /**
   * Sweeps and transitions expired pending tickets to TIMED_OUT.
   */
  public async expireStaleTickets(now = new Date()): Promise<number> {
    const result = await this.db.query<{ count?: number }>(
      APPROVAL_SQL_QUERIES.EXPIRE_STALE_TICKETS,
      [now],
    );
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
      stepId: row.step_id ?? undefined,
      stepIndex: 0,
      toolName: row.tool_name,
      toolArguments: toolArgs,
      riskLevel: "HIGH",
      rationale: row.rationale,
      status: row.status as ApprovalStatus,
      operatorId: row.operator_id ?? undefined,
      rejectionReason: row.rejection_reason ?? undefined,
      modifiedArguments: modifiedArgs,
      requestedAt: new Date(row.requested_at),
      expiresAt: new Date(row.expires_at),
      decidedAt: row.decided_at ? new Date(row.decided_at) : undefined,
    };
  }
}
