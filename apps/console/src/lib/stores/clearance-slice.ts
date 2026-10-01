/**
 * @file apps/console/src/lib/stores/clearance-slice.ts
 * @description Zustand store slice governing global HITL clearance drawer and approval tickets.
 * @module apps/console/lib/stores
 */

import type { StateCreator } from "zustand";
import type { ApprovalRiskLevel, ApprovalDecisionVerdict } from "@orchestrai/shared-types";

/**
 * Interactive security clearance request ticket.
 */
export interface ConsoleClearanceTicket {
  readonly ticketId: string;
  readonly executionId: string;
  readonly toolName: string;
  readonly riskLevel: ApprovalRiskLevel | string;
  readonly description: string;
  readonly inputParams?: Record<string, unknown>;
  readonly sensitivePaths?: string[];
  readonly createdAt: number;
}

/**
 * Resolved clearance decision record.
 */
export interface ResolvedClearanceRecord {
  readonly ticketId: string;
  readonly verdict: ApprovalDecisionVerdict | string;
  readonly resolvedAt: number;
}

/**
 * State and actions for security clearances and drawer visibility.
 */
export interface ClearanceSlice {
  isClearanceDrawerOpen: boolean;
  pendingTickets: ConsoleClearanceTicket[];
  resolvedHistory: ResolvedClearanceRecord[];

  setClearanceDrawerOpen: (isOpen: boolean) => void;
  toggleClearanceDrawer: () => void;
  addClearanceTicket: (ticket: ConsoleClearanceTicket) => void;
  resolveClearanceTicket: (ticketId: string, verdict: ApprovalDecisionVerdict | string) => void;
  dismissTicket: (ticketId: string) => void;
}

export const createClearanceSlice: StateCreator<ClearanceSlice, [], [], ClearanceSlice> = (
  set,
) => ({
  isClearanceDrawerOpen: false,
  pendingTickets: [],
  resolvedHistory: [],

  setClearanceDrawerOpen: (isOpen) => set({ isClearanceDrawerOpen: isOpen }),
  toggleClearanceDrawer: () =>
    set((state) => ({ isClearanceDrawerOpen: !state.isClearanceDrawerOpen })),
  addClearanceTicket: (ticket) =>
    set((state) => ({
      pendingTickets: [
        ...state.pendingTickets.filter((t) => t.ticketId !== ticket.ticketId),
        ticket,
      ],
      isClearanceDrawerOpen: true, // Auto-slide drawer on high-risk interrupt
    })),
  resolveClearanceTicket: (ticketId, verdict) =>
    set((state) => ({
      pendingTickets: state.pendingTickets.filter((t) => t.ticketId !== ticketId),
      resolvedHistory: [{ ticketId, verdict, resolvedAt: Date.now() }, ...state.resolvedHistory],
      isClearanceDrawerOpen: state.pendingTickets.length > 1,
    })),
  dismissTicket: (ticketId) =>
    set((state) => ({
      pendingTickets: state.pendingTickets.filter((t) => t.ticketId !== ticketId),
    })),
});
