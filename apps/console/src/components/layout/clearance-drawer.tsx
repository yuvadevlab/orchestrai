"use client";

/**
 * @file apps/console/src/components/layout/clearance-drawer.tsx
 * @description Slide-out HITL Security Clearance Drawer with blast-radius inspection and keyboard shortcuts.
 * @module apps/console/components/layout
 */

import React, { useEffect } from "react";
import { ShieldAlert, Check, X, AlertTriangle, FileWarning, Terminal } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { useConsoleStore } from "@/lib/stores";

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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={() => setOpen(false)}
        className="bg-background/80 fixed inset-0 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Drawer Panel */}
      <div className="border-border bg-card relative z-50 flex size-full max-w-lg flex-col border-l p-6 shadow-2xl">
        {/* Header */}
        <div className="border-border/60 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-destructive/10 text-destructive flex size-8 items-center justify-center rounded-md">
              <ShieldAlert className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Security Clearance Required</h2>
              <span className="text-muted-foreground font-mono text-[11px]">
                {pendingTickets.length} pending approval{" "}
                {pendingTickets.length === 1 ? "ticket" : "tickets"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        {activeTicket ? (
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {/* Risk Badge and Tool Intent */}
            <div className="bg-destructive/5 border-destructive/30 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-destructive font-mono text-xs font-semibold uppercase">
                  Risk Level: {String(activeTicket.riskLevel)}
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  ID: {activeTicket.ticketId.slice(0, 8)}
                </span>
              </div>
              <p className="text-foreground mt-2 text-xs font-medium">{activeTicket.description}</p>
            </div>

            {/* Target Tool */}
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[11px] font-medium">
                Invoking Tool
              </span>
              <div className="border-border/60 bg-muted/30 flex items-center gap-2 rounded border px-3 py-2">
                <Terminal className="text-primary size-4" />
                <span className="text-foreground font-mono text-xs font-semibold">
                  {activeTicket.toolName}
                </span>
              </div>
            </div>

            {/* Blast-Radius Sensitive Paths */}
            {activeTicket.sensitivePaths && activeTicket.sensitivePaths.length > 0 && (
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                  <FileWarning className="text-destructive size-3" /> Blast-Radius Target Resources
                </span>
                <div className="border-destructive/20 bg-destructive/5 rounded border p-2 font-mono text-xs">
                  {activeTicket.sensitivePaths.map((path) => (
                    <div key={path} className="text-destructive truncate py-0.5">
                      • {path}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parameter Payload Inspector */}
            {activeTicket.inputParams && (
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px] font-medium">
                  Payload Parameters
                </span>
                <pre className="border-border/60 bg-muted/30 text-muted-foreground max-h-48 overflow-y-auto rounded border p-3 font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(activeTicket.inputParams, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <AlertTriangle className="text-muted-foreground mb-2 size-8" />
            <p className="text-muted-foreground text-xs">
              No pending clearance tickets require intervention.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        {activeTicket && (
          <div className="border-border/60 flex flex-col gap-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                className="flex-1 gap-1.5 text-xs font-medium"
                onClick={() => resolveTicket(activeTicket.ticketId, "REJECTED")}
              >
                <X className="size-3.5" />
                <span>Deny Action</span>
              </Button>
              <Button
                variant="default"
                className="flex-1 gap-1.5 text-xs font-medium"
                onClick={() => resolveTicket(activeTicket.ticketId, "APPROVED")}
              >
                <Check className="size-3.5" />
                <span>Approve (⌘+Enter)</span>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => dismissTicket(activeTicket.ticketId)}
              className="text-muted-foreground hover:text-foreground text-center text-[11px]"
            >
              Dismiss ticket from queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
