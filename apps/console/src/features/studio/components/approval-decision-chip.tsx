/**
 * @file approval-decision-chip.tsx
 * @description Compact inline audit chip rendering the operator's clearance decision in the message stream.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { Badge } from "@yuva-devlab/ui";
import { PermissionScope } from "@orchestrai/shared-types";
import type { StudioApprovalRequest } from "../types";

export interface ApprovalDecisionChipProps {
  /** The clearance ticket containing the operator's decision */
  request: StudioApprovalRequest;
}

/**
 * Compact inline audit chip rendered in the message thread after the user resolves
 * a permission request via the LiveActivityBar. Provides a permanent, scannable
 * record of what was approved or denied and when.
 */
export function ApprovalDecisionChip({ request }: ApprovalDecisionChipProps): React.JSX.Element {
  const isDeny = request.resolvedScope === PermissionScope.DENY;
  const time = request.resolvedAt
    ? new Date(request.resolvedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      role="log"
      aria-label={`Permission decision: ${request.resolvedScope}`}
      className="border-border/40 bg-muted/20 my-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border px-3 py-1.5 font-mono text-[11px]"
    >
      {/* Decision icon */}
      {isDeny ? (
        <X className="text-destructive size-3.5 shrink-0" />
      ) : (
        <ShieldCheck className="text-primary size-3.5 shrink-0" />
      )}

      {/* Verb + scope */}
      <span className={isDeny ? "text-destructive font-semibold" : "text-primary font-semibold"}>
        {isDeny ? "Denied" : `Cleared (${request.resolvedScope})`}
      </span>

      {/* Separator */}
      <span className="text-muted-foreground/40">·</span>

      {/* Tool badge */}
      <Badge
        variant="outline"
        className="border-border/60 text-muted-foreground px-1.5 py-0 font-mono text-[10px]"
      >
        {request.tool}
      </Badge>

      {/* Target path — truncated for readability */}
      <span className="text-muted-foreground/80 max-w-xs truncate text-[10px]">
        {request.target}
      </span>

      {/* Timestamp */}
      {time && <span className="text-muted-foreground/50 ml-auto text-[10px]">{time}</span>}
    </div>
  );
}
