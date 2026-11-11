"use client";

/**
 * @file studio-live-clearance-card.tsx
 * @description Security clearance prompt card that takes over the prompt input bar when permissions are required.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { ShieldAlert, Terminal, Clock, ShieldCheck, CheckCheck, X, Loader2 } from "lucide-react";
import { Button, Badge } from "@orchestrai/ui";
import { PermissionScope, ApprovalRiskLevel } from "@orchestrai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import type { StudioApprovalRequest } from "../types";

export interface StudioLiveClearanceCardProps {
  /** The pending approval request ticket */
  pendingApproval: StudioApprovalRequest;
  /** Handler to invoke when an approval action is clicked */
  onResolve: (approvalId: string, scope: PermissionScope) => Promise<void>;
  /** Callback after resolution to update the message audit log in the stream */
  onResolved?: (approvalId: string, scope: PermissionScope, resolvedAt: string) => void;
}

/**
 * Interactive clearance card replacing the prompt textarea when human-in-the-loop authorization is needed.
 * Disappears immediately once resolved, allowing the decision log to render in the stream.
 */
export function StudioLiveClearanceCard({
  pendingApproval,
  onResolve,
  onResolved,
}: StudioLiveClearanceCardProps): React.JSX.Element {
  const [submittingScope, setSubmittingScope] = useState<string | null>(null);

  // Critical risk determination based on explicit sensitive flag or CRITICAL enum
  const isCritical =
    pendingApproval.isSensitive || pendingApproval.riskLevel === ApprovalRiskLevel.CRITICAL;

  const handleAction = async (scope: PermissionScope): Promise<void> => {
    setSubmittingScope(scope);
    try {
      await onResolve(pendingApproval.id, scope);
      const resolvedAt = new Date().toISOString();
      onResolved?.(pendingApproval.id, scope, resolvedAt);
    } finally {
      setSubmittingScope(null);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-label={UI_COPY.STUDIO.CLEARANCE.A11Y_REQUIRED}
      className={`orch-clearance-card ${
        isCritical ? "orch-clearance-card--critical" : "orch-clearance-card--warning"
      }`}
      style={{ margin: 0, backdropFilter: "blur(12px)" }}
    >
      {/* Header with Title and Tool Badge */}
      <div
        className="orch-flex-row orch-justify-between"
        style={{ alignItems: "center", marginBottom: "0.625rem", gap: "0.75rem" }}
      >
        <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <div
            style={{
              display: "grid",
              width: "1.5rem",
              height: "1.5rem",
              placeItems: "center",
              borderRadius: "var(--radius-sm, 0.25rem)",
              backgroundColor: isCritical
                ? "color-mix(in oklab, var(--destructive) 15%, transparent)"
                : "color-mix(in oklab, var(--warning, #eab308) 15%, transparent)",
              color: isCritical ? "var(--destructive)" : "var(--warning, #eab308)",
            }}
          >
            <ShieldAlert style={{ width: "1rem", height: "1rem" }} />
          </div>
          <span className="orch-font-semibold" style={{ fontSize: "0.875rem" }}>
            {isCritical
              ? UI_COPY.STUDIO.CLEARANCE.TITLE_SENSITIVE
              : UI_COPY.STUDIO.CLEARANCE.TITLE_SECURITY}
          </span>
        </div>
        <Badge
          variant="outline"
          className="orch-font-mono"
          style={{
            fontSize: "0.625rem",
            borderColor: isCritical
              ? "color-mix(in oklab, var(--destructive) 40%, transparent)"
              : "color-mix(in oklab, var(--warning, #eab308) 40%, transparent)",
            color: isCritical ? "var(--destructive)" : "var(--warning, #eab308)",
          }}
        >
          {pendingApproval.tool}
        </Badge>
      </div>

      {/* Description / Reason */}
      <p
        className="orch-text-muted"
        style={{ margin: 0, marginBottom: "0.75rem", fontSize: "0.75rem", lineHeight: 1.5 }}
      >
        {pendingApproval.reason}
      </p>

      {/* Target Resource Path */}
      <div
        className="orch-flex-row orch-gap-xs"
        style={{
          alignItems: "flex-start",
          marginBottom: "1rem",
          borderRadius: "var(--radius-sm, 0.25rem)",
          border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--background) 80%, transparent)",
          padding: "0.5rem 0.75rem",
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        <Terminal
          className="orch-text-muted"
          style={{ marginTop: "0.125rem", width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 500,
            wordBreak: "break-all",
            userSelect: "all",
          }}
        >
          {pendingApproval.target}
        </span>
      </div>

      {/* Action Buttons Toolbar */}
      <div
        className="orch-flex-row orch-gap-xs"
        style={{ flexWrap: "wrap", alignItems: "center", paddingTop: "0.25rem" }}
      >
        <Button
          variant="outline"
          size="sm"
          id="clearance-once"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.ONCE)}
          style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
        >
          {submittingScope === PermissionScope.ONCE ? (
            <Loader2
              style={{ width: "0.75rem", height: "0.75rem" }}
              className="orch-animate-spin"
            />
          ) : (
            <Clock style={{ width: "0.75rem", height: "0.75rem" }} />
          )}
          {UI_COPY.STUDIO.CLEARANCE.ALLOW_ONCE}
        </Button>

        <Button
          variant="outline"
          size="sm"
          id="clearance-session"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.SESSION)}
          style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
        >
          {submittingScope === PermissionScope.SESSION ? (
            <Loader2
              style={{ width: "0.75rem", height: "0.75rem" }}
              className="orch-animate-spin"
            />
          ) : (
            <ShieldCheck
              className="orch-text-primary"
              style={{ width: "0.75rem", height: "0.75rem" }}
            />
          )}
          {UI_COPY.STUDIO.CLEARANCE.THIS_CHAT}
        </Button>

        <Button
          variant="default"
          size="sm"
          id="clearance-permanent"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.PERMANENT)}
          style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
        >
          {submittingScope === PermissionScope.PERMANENT ? (
            <Loader2
              style={{ width: "0.75rem", height: "0.75rem" }}
              className="orch-animate-spin"
            />
          ) : (
            <CheckCheck style={{ width: "0.75rem", height: "0.75rem" }} />
          )}
          {UI_COPY.STUDIO.CLEARANCE.ALWAYS_ALLOW}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          id="clearance-deny"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.DENY)}
          className="orch-text-destructive"
          style={{
            marginLeft: "auto",
            height: "2rem",
            gap: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {submittingScope === PermissionScope.DENY ? (
            <Loader2
              style={{ width: "0.75rem", height: "0.75rem" }}
              className="orch-animate-spin"
            />
          ) : (
            <X style={{ width: "0.75rem", height: "0.75rem" }} />
          )}
          {UI_COPY.STUDIO.CLEARANCE.DENY}
        </Button>
      </div>
    </div>
  );
}
