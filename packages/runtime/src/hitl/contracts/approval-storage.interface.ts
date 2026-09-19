/**
 * @file packages/runtime/src/hitl/contracts/approval-storage.interface.ts
 * @description Storage adapter contract for persisting, querying, and resolving HITL approval tickets.
 */

import type { ApprovalResolutionInput, ApprovalTicket } from "./approval-ticket.types";

/**
 * Storage adapter interface managing approval ticket persistence and state transitions.
 */
export interface IApprovalStorage {
  /**
   * Persists a newly created approval ticket into storage.
   *
   * @param ticket - ApprovalTicket payload to insert.
   * @returns The created ApprovalTicket.
   */
  createTicket(ticket: ApprovalTicket): Promise<ApprovalTicket>;

  /**
   * Retrieves an approval ticket by its unique UUID.
   *
   * @param approvalId - Approval ticket identifier.
   * @returns The ApprovalTicket, or undefined if not found.
   */
  getTicket(approvalId: string): Promise<ApprovalTicket | undefined>;

  /**
   * Lists active PENDING approval tickets, optionally filtered by execution run.
   *
   * @param executionId - Optional execution ID filter.
   * @returns Ordered array of pending approval tickets.
   */
  listPending(executionId?: string): Promise<readonly ApprovalTicket[]>;

  /**
   * Records an operator's decision, transitioning ticket status atomically.
   *
   * @param approvalId - Approval ticket identifier.
   * @param resolution - Operator verdict, reason, and optional modified arguments.
   * @returns The resolved ApprovalTicket.
   */
  resolveTicket(approvalId: string, resolution: ApprovalResolutionInput): Promise<ApprovalTicket>;

  /**
   * Sweeps expired pending tickets where expiresAt < now, transitioning them to TIMED_OUT.
   *
   * @param now - Optional reference date (defaults to current system time).
   * @returns Number of tickets transitioned to TIMED_OUT.
   */
  expireStaleTickets(now?: Date): Promise<number>;
}
