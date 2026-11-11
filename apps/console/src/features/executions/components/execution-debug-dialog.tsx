"use client";

/**
 * @file execution-debug-dialog.tsx
 * @description Forensic developer debug dialog for deep-diving into execution state, errors, and traces.
 * Powered by @orchestrai/ui Dialog primitives for accessible dialog behavior and sizing.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
} from "@orchestrai/ui";
import { Check, Copy, AlertTriangle, ExternalLink, Terminal } from "lucide-react";
import Link from "next/link";
import type { ExecutionRun } from "../types";
import { StatusBadge } from "@orchestrai/ui/components/status-badge";
import { UI_COPY } from "@/lib/ui-copy";
import { ExecutionDebugMetricsGrid } from "./execution-debug-metrics-grid";
import { ExecutionDebugPayload } from "./execution-debug-payload";

export interface ExecutionDebugDialogProps {
  /** The execution record to inspect, or null if modal is closed */
  execution: ExecutionRun | null;
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback fired when dialog dismiss is requested */
  onClose: () => void;
}

/**
 * Forensic developer debug dialog displaying execution metadata, step graphs, and raw state JSON.
 * Utilizes @orchestrai/ui Dialog with size="2xl".
 */
export function ExecutionDebugDialog({
  execution,
  isOpen,
  onClose,
}: ExecutionDebugDialogProps): React.JSX.Element | null {
  const [copiedId, setCopiedId] = useState(false);

  // Guard: Return early if dialog is closed or no execution is loaded
  if (!execution) {
    return null;
  }

  const handleCopyId = (): void => {
    if (!execution.id) return;
    navigator.clipboard.writeText(execution.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="2xl">
        <DialogHeader>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.75rem",
              paddingRight: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Terminal style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
              <DialogTitle style={{ fontFamily: "var(--font-display, sans-serif)", margin: 0 }}>
                {UI_COPY.EXECUTIONS.DEBUG_DIALOG.TITLE}
              </DialogTitle>
            </div>
            <StatusBadge status={execution.status} />
            <div
              style={{
                color: "var(--mutedForeground)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
              }}
            >
              <span>{UI_COPY.EXECUTIONS.DEBUG_DIALOG.ID_PREFIX(execution.id)}</span>
              <button
                type="button"
                onClick={handleCopyId}
                style={{
                  color: "inherit",
                  display: "inline-flex",
                  cursor: "pointer",
                  alignItems: "center",
                  gap: "0.25rem",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                }}
                title={UI_COPY.EXECUTIONS.DEBUG_DIALOG.COPY_ID_TOOLTIP}
                aria-label={UI_COPY.EXECUTIONS.DEBUG_DIALOG.COPY_ID_TOOLTIP}
              >
                {copiedId ? (
                  <Check
                    style={{
                      color: "var(--success, #22c55e)",
                      width: "0.75rem",
                      height: "0.75rem",
                    }}
                  />
                ) : (
                  <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
                )}
                <span style={{ fontSize: "0.625rem" }}>
                  {copiedId ? UI_COPY.COMMON.ACTIONS.COPIED : UI_COPY.COMMON.ACTIONS.COPY}
                </span>
              </button>
            </div>
          </div>
          <DialogDescription className="orch-sr-only">
            {UI_COPY.EXECUTIONS.DEBUG_DIALOG.DESCRIPTION(execution.id)}
          </DialogDescription>
        </DialogHeader>

        <DialogBody
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            overflowY: "auto",
            paddingInline: "1.5rem",
            paddingBlock: "1.25rem",
          }}
        >
          {/* Error Callout if Failed */}
          {execution.errorMessage && (
            <div
              style={{
                border: "1px solid color-mix(in oklab, var(--destructive) 40%, transparent)",
                backgroundColor: "color-mix(in oklab, var(--destructive) 10%, transparent)",
                color: "var(--destructive)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                borderRadius: "var(--radius-md, 0.375rem)",
                padding: "0.875rem",
                fontSize: "0.75rem",
              }}
            >
              <AlertTriangle
                style={{ marginTop: "0.125rem", width: "1rem", height: "1rem", flexShrink: 0 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p style={{ fontWeight: 600, margin: 0 }}>
                  {UI_COPY.EXECUTIONS.DEBUG_DIALOG.FAILURE_TITLE}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6875rem",
                    lineHeight: 1.5,
                    wordBreak: "break-all",
                    margin: 0,
                  }}
                >
                  {execution.errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Row */}
          <ExecutionDebugMetricsGrid execution={execution} />

          {/* Steps Trace and Raw JSON State */}
          <ExecutionDebugPayload execution={execution} />
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
          >
            {UI_COPY.COMMON.ACTIONS.CLOSE}
          </Button>
          {execution.conversationId && (
            <Button
              asChild
              variant="default"
              size="sm"
              style={{
                height: "2rem",
                cursor: "pointer",
                gap: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              <Link href={`/session/${execution.conversationId}`}>
                <span>{UI_COPY.EXECUTIONS.DEBUG_DIALOG.OPEN_SESSION}</span>
                <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
