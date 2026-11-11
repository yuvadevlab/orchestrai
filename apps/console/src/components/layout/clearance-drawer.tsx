"use client";

/**
 * @file apps/console/src/components/layout/clearance-drawer.tsx
 * @description Slide-out HITL Security Clearance Drawer with blast-radius inspection and keyboard shortcuts.
 * @module apps/console/components/layout
 */

import React, { useEffect } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { useConsoleStore } from "@/lib/stores";
import { UI_COPY } from "@/lib/ui-copy";
import { ClearanceTicketDetails } from "./clearance-ticket-details";

/**
 * Slide-out Human-In-The-Loop (HITL) Security Clearance Drawer.
 */
export function ClearanceDrawer(): React.JSX.Element | null {
  const isOpen = useConsoleStore((s) => s.isClearanceDrawerOpen);
  const pendingTickets = useConsoleStore((s) => s.pendingTickets);
  const setOpen = useConsoleStore((s) => s.setClearanceDrawerOpen);
  const resolveTicket = useConsoleStore((s) => s.resolveClearanceTicket);
  const dismissTicket = useConsoleStore((s) => s.dismissTicket);

  const activeTicket = pendingTickets[0];

  // Global keyboard shortcuts: Cmd+Enter to approve, Esc to close/reject
  useEffect(() => {
    if (!isOpen || !activeTicket) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        resolveTicket(activeTicket.ticketId, "APPROVED");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTicket, resolveTicket, setOpen]);

  if (!isOpen) return null;

  return (
    <div className="orch-clearance-overlay">
      {/* Backdrop */}
      <div role="presentation" onClick={() => setOpen(false)} className="orch-clearance-backdrop" />

      {/* Slide-out Drawer Panel */}
      <div className="orch-clearance-panel">
        {/* Header */}
        <div className="orch-clearance-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div className="orch-clearance-icon">
              <ShieldAlert style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {UI_COPY.STUDIO.CLEARANCE.DRAWER.TITLE}
              </h2>
              <span
                style={{
                  color: "var(--mutedForeground)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                }}
              >
                {UI_COPY.STUDIO.CLEARANCE.DRAWER.PENDING_COUNT(pendingTickets.length)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={UI_COPY.COMMON.ACTIONS.CLOSE}
            style={{
              color: "var(--mutedForeground)",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              padding: "0.25rem",
            }}
          >
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>

        {/* Content Body */}
        <ClearanceTicketDetails ticket={activeTicket} />

        {/* Footer Actions */}
        {activeTicket && (
          <div className="orch-clearance-footer">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Button
                variant="destructive"
                style={{ flex: 1, gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
                onClick={() => resolveTicket(activeTicket.ticketId, "REJECTED")}
              >
                <X style={{ width: "0.875rem", height: "0.875rem" }} />
                <span>{UI_COPY.STUDIO.CLEARANCE.DRAWER.DENY_ACTION}</span>
              </Button>
              <Button
                variant="default"
                style={{ flex: 1, gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
                onClick={() => resolveTicket(activeTicket.ticketId, "APPROVED")}
              >
                <Check style={{ width: "0.875rem", height: "0.875rem" }} />
                <span>{UI_COPY.STUDIO.CLEARANCE.DRAWER.APPROVE_ACTION}</span>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => dismissTicket(activeTicket.ticketId)}
              style={{
                color: "var(--mutedForeground)",
                textAlign: "center",
                fontSize: "0.6875rem",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {UI_COPY.STUDIO.CLEARANCE.DRAWER.DISMISS}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
