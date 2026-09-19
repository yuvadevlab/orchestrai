/**
 * @file packages/runtime/src/hitl/storage/memory-approval-storage.ts
 * @description In-memory implementation of IApprovalStorage for local development and tests.
 */

import { ApprovalStatus } from "@orchestrai/shared-types";
import { OrchestrAIError } from "@orchestrai/core";
import type { ApprovalResolutionInput, ApprovalTicket, IApprovalStorage } from "../contracts";

/**
 * Ephemeral in-memory approval storage managing active tickets and status transitions.
 */
export class MemoryApprovalStorage implements IApprovalStorage {
  private readonly tickets = new Map<string, ApprovalTicket>();

  /**
   * Enqueues and indexes a new approval ticket.
   */
  public async createTicket(ticket: ApprovalTicket): Promise<ApprovalTicket> {
    this.tickets.set(ticket.approvalId, ticket);
    return ticket;
  }

  /**
   * Retrieves an approval ticket by its identifier.
   */
  public async getTicket(approvalId: string): Promise<ApprovalTicket | undefined> {
    return this.tickets.get(approvalId);
  }

  /**
   * Lists all PENDING approval tickets, optionally filtered by execution run.
   */
  public async listPending(executionId?: string): Promise<readonly ApprovalTicket[]> {
    const list: ApprovalTicket[] = [];

    for (const ticket of this.tickets.values()) {
      // Guard: Filter only tickets currently in PENDING state
      if (ticket.status !== ApprovalStatus.PENDING) {
        continue;
      }

      // Guard: Apply executionId filter when provided
      if (executionId && ticket.executionId !== executionId) {
        continue;
      }

      list.push(ticket);
    }

    // Sort chronologically ascending
    return list.sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime());
  }

  /**
   * Resolves a pending ticket with operator verdict and optional argument modifications.
   */
  public async resolveTicket(
    approvalId: string,
    resolution: ApprovalResolutionInput,
  ): Promise<ApprovalTicket> {
    const existing = this.tickets.get(approvalId);
    if (!existing) {
      throw new OrchestrAIError(`Approval ticket "${approvalId}" not found`, "NOT_FOUND", 404, {
        approvalId,
      });
    }

    // Guard: Prevent double-resolution if ticket has already been decided or timed out
    if (existing.status !== ApprovalStatus.PENDING) {
      throw new OrchestrAIError(
        `Cannot resolve ticket "${approvalId}": already in status "${existing.status}"`,
        "VALIDATION_ERROR",
        400,
        { approvalId, status: existing.status },
      );
    }

    // Invariant: ApprovalStatus permits PENDING, APPROVED, REJECTED, TIMED_OUT
    const nextStatus =
      resolution.decision === "APPROVED" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    const rejectionReason =
      resolution.reason ??
      (resolution.decision === "CANCELLED" ? "Execution cancelled by operator" : undefined);

    const resolved: ApprovalTicket = {
      ...existing,
      status: nextStatus,
      operatorId: resolution.operatorId,
      rejectionReason,
      modifiedArguments: resolution.modifiedArguments ?? existing.modifiedArguments,
      decidedAt: new Date(),
    };

    this.tickets.set(approvalId, resolved);
    return resolved;
  }

  /**
   * Sweeps pending tickets where expiration deadline has passed, transitioning to TIMED_OUT.
   */
  public async expireStaleTickets(now = new Date()): Promise<number> {
    let expiredCount = 0;

    for (const [id, ticket] of this.tickets.entries()) {
      // Check if ticket is pending and past deadline
      if (ticket.status === ApprovalStatus.PENDING && ticket.expiresAt.getTime() < now.getTime()) {
        const timedOut: ApprovalTicket = {
          ...ticket,
          status: ApprovalStatus.TIMED_OUT,
          rejectionReason: "Approval window expired without human response",
          decidedAt: now,
        };
        this.tickets.set(id, timedOut);
        expiredCount += 1;
      }
    }

    return expiredCount;
  }

  /**
   * Clears all stored tickets (useful for test tear-down).
   */
  public clear(): void {
    this.tickets.clear();
  }
}
