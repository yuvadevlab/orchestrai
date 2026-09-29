"use client";

/**
 * @file studio-live-clearance-card.tsx
 * @description Security clearance prompt card that takes over the prompt input bar when permissions are required.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { ShieldAlert, Terminal, Clock, ShieldCheck, CheckCheck, X, Loader2 } from "lucide-react";
import { Button, Badge } from "@yuva-devlab/ui";
import { PermissionScope, ApprovalRiskLevel } from "@orchestrai/shared-types";
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
      aria-label="Security clearance required"
      className={`bg-card/95 rounded-md border p-4 shadow-xl backdrop-blur-md transition-all ${
        isCritical ? "border-destructive/60 bg-destructive/5" : "border-warning/50 bg-warning/5"
      }`}
    >
      {/* Header with Title and Tool Badge */}
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`grid size-6 shrink-0 place-items-center rounded-sm ${
              isCritical ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
            }`}
          >
            <ShieldAlert className="size-4" />
          </div>
          <span className="text-foreground text-sm font-semibold">
            {isCritical ? "Sensitive Action Clearance Required" : "Security Clearance Required"}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`font-mono text-[10px] ${
            isCritical ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning"
          }`}
        >
          {pendingApproval.tool}
        </Badge>
      </div>

      {/* Description / Reason */}
      <p className="text-muted-foreground mb-3 text-xs leading-relaxed">{pendingApproval.reason}</p>

      {/* Target Resource Path */}
      <div className="border-border/60 bg-background/80 mb-4 flex items-start gap-2 rounded border px-3 py-2 font-mono">
        <Terminal className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
        <span className="text-foreground text-[11px] font-medium break-all select-all">
          {pendingApproval.target}
        </span>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          id="clearance-once"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.ONCE)}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          {submittingScope === PermissionScope.ONCE ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Clock className="size-3" />
          )}
          Allow Once
        </Button>

        <Button
          variant="outline"
          size="sm"
          id="clearance-session"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.SESSION)}
          className="border-primary/40 hover:bg-primary/10 h-8 gap-1.5 text-xs font-medium"
        >
          {submittingScope === PermissionScope.SESSION ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <ShieldCheck className="text-primary size-3" />
          )}
          This Chat
        </Button>

        <Button
          variant="default"
          size="sm"
          id="clearance-permanent"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.PERMANENT)}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          {submittingScope === PermissionScope.PERMANENT ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <CheckCheck className="size-3" />
          )}
          Always Allow
        </Button>

        <Button
          variant="ghost"
          size="sm"
          id="clearance-deny"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.DENY)}
          className="text-destructive hover:bg-destructive/10 ml-auto h-8 gap-1.5 text-xs font-medium"
        >
          {submittingScope === PermissionScope.DENY ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <X className="size-3" />
          )}
          Deny
        </Button>
      </div>
    </div>
  );
}
