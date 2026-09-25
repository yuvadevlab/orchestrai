"use client";

/**
 * @file studio-permission-card.tsx
 * @description Interactive Human-in-the-Loop clearance card with 3-tier permission actions (Once, Session, Permanent, Deny).
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { ShieldAlert, Check, X, ShieldCheck, Clock, CheckCheck } from "lucide-react";
import { Button, Badge } from "@yuva-devlab/ui";
import type { StudioApprovalRequest } from "../types";

export interface StudioPermissionCardProps {
  request: StudioApprovalRequest;
  onResolve: (
    approvalId: string,
    scope: "once" | "session" | "permanent" | "deny",
  ) => Promise<void>;
}

/**
 * Renders an interactive security clearance card for external filesystem or shell execution requests.
 */
export function StudioPermissionCard({
  request,
  onResolve,
}: StudioPermissionCardProps): React.JSX.Element {
  const [submittingScope, setSubmittingScope] = useState<string | null>(null);
  const [resolvedScope, setResolvedScope] = useState<string | null>(null);

  const handleAction = async (scope: "once" | "session" | "permanent" | "deny"): Promise<void> => {
    setSubmittingScope(scope);
    try {
      await onResolve(request.id, scope);
      setResolvedScope(scope);
    } finally {
      setSubmittingScope(null);
    }
  };

  if (resolvedScope) {
    const isDeny = resolvedScope === "deny";
    return (
      <div className="border-border/40 bg-muted/20 text-muted-foreground my-1.5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px]">
        {isDeny ? (
          <X className="text-destructive size-3.5" />
        ) : (
          <Check className="text-primary size-3.5" />
        )}
        <span className="text-foreground font-semibold">
          {isDeny ? "Permission Denied" : `Clearance Granted (${resolvedScope})`}
        </span>
        <span className="text-muted-foreground/40">•</span>
        <span className="text-muted-foreground/80 max-w-sm truncate text-[10px]">
          {request.target}
        </span>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-amber-500/20 text-amber-600">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                Security Clearance Required
              </span>
              <Badge
                variant="outline"
                className="border-amber-500/40 font-mono text-[10px] text-amber-600"
              >
                {request.tool}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">{request.reason}</p>
          </div>
        </div>
      </div>

      {/* Target Path or Command Display */}
      <div className="border-border/60 bg-background/80 my-3 rounded-md border p-2.5 font-mono text-xs">
        <div className="text-muted-foreground text-[10px] font-semibold uppercase">
          Requested Target
        </div>
        <div className="text-foreground mt-1 font-mono font-medium break-all select-all">
          {request.target}
        </div>
      </div>

      {/* 3-Tier Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction("once")}
          className="h-7 gap-1.5 text-xs"
        >
          <Clock className="size-3" />
          <span>Allow Once</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction("session")}
          className="border-primary/40 hover:bg-primary/10 h-7 gap-1.5 text-xs"
        >
          <ShieldCheck className="text-primary size-3" />
          <span>Allow for this Chat</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction("permanent")}
          className="h-7 gap-1.5 text-xs"
        >
          <CheckCheck className="size-3" />
          <span>Always Allow</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction("deny")}
          className="text-destructive hover:bg-destructive/10 ml-auto h-7 gap-1.5 text-xs"
        >
          <X className="size-3" />
          <span>Deny</span>
        </Button>
      </div>
    </div>
  );
}
