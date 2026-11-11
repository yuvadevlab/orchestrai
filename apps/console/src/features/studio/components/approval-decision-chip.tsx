/**
 * @file approval-decision-chip.tsx
 * @description Compact inline audit chip rendering the operator's clearance decision in the message stream.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { Badge } from "@orchestrai/ui";
import { PermissionScope } from "@orchestrai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import type { StudioApprovalRequest } from "../types";

export interface ApprovalDecisionChipProps {
  /** The clearance ticket containing the operator's decision */
  request: StudioApprovalRequest;
}

/**
 * Compact inline audit chip rendered in the message thread after the user resolves
 * a permission request via the LiveActivityBar.
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
      aria-label={UI_COPY.STUDIO.CLEARANCE.DECISION_LOG_A11Y(request.resolvedScope ?? "")}
      className="orch-decision-chip"
    >
      {/* Decision icon */}
      {isDeny ? (
        <X
          className="orch-text-destructive"
          style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
        />
      ) : (
        <ShieldCheck
          className="orch-text-primary"
          style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
        />
      )}

      {/* Verb + scope */}
      <span
        className={
          isDeny
            ? "orch-text-destructive orch-font-semibold"
            : "orch-text-primary orch-font-semibold"
        }
      >
        {isDeny
          ? UI_COPY.STUDIO.CLEARANCE.DENIED_SHORT
          : UI_COPY.STUDIO.CLEARANCE.CLEARED_SHORT(request.resolvedScope ?? "")}
      </span>

      {/* Separator */}
      <span className="orch-text-muted" style={{ opacity: 0.4 }}>
        ·
      </span>

      {/* Tool badge */}
      <Badge
        variant="outline"
        className="orch-font-mono orch-text-muted"
        style={{ padding: "0 0.375rem", fontSize: "0.625rem" }}
      >
        {request.tool}
      </Badge>

      {/* Target path — truncated for readability */}
      <span
        className="orch-text-muted orch-truncate"
        style={{ maxWidth: "20rem", fontSize: "0.625rem" }}
      >
        {request.target}
      </span>

      {/* Timestamp */}
      {time && (
        <span
          className="orch-text-muted"
          style={{ marginLeft: "auto", fontSize: "0.625rem", opacity: 0.5 }}
        >
          {time}
        </span>
      )}
    </div>
  );
}
