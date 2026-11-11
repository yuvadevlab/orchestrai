"use client";

/**
 * @file studio-permission-card.tsx
 * @description Interactive Human-in-the-Loop clearance card with 3-tier permission actions (Once, Session, Permanent, Deny).
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { ShieldAlert, Check, X, ShieldCheck, Clock, CheckCheck } from "lucide-react";
import { Button, Badge } from "@orchestrai/ui";
import { PermissionScope, ApprovalRiskLevel } from "@orchestrai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import type { StudioApprovalRequest } from "../types";

export interface StudioPermissionCardProps {
  request: StudioApprovalRequest;
  onResolve: (approvalId: string, scope: PermissionScope) => Promise<void>;
}

/**
 * Renders an interactive security clearance card for external filesystem or shell execution requests.
 */
export function StudioPermissionCard({
  request,
  onResolve,
}: StudioPermissionCardProps): React.JSX.Element {
  const [submittingScope, setSubmittingScope] = useState<string | null>(null);
  const [resolvedScope, setResolvedScope] = useState<PermissionScope | null>(null);

  const handleAction = async (scope: PermissionScope): Promise<void> => {
    setSubmittingScope(scope);
    try {
      await onResolve(request.id, scope);
      setResolvedScope(scope);
    } finally {
      setSubmittingScope(null);
    }
  };

  if (resolvedScope) {
    const isDeny = resolvedScope === PermissionScope.DENY;
    return (
      <div className="orch-decision-chip">
        {isDeny ? (
          <X className="orch-text-destructive" style={{ width: "0.875rem", height: "0.875rem" }} />
        ) : (
          <Check className="orch-text-primary" style={{ width: "0.875rem", height: "0.875rem" }} />
        )}
        <span className="orch-font-semibold">
          {isDeny
            ? UI_COPY.STUDIO.CLEARANCE.DENIED_LABEL
            : UI_COPY.STUDIO.CLEARANCE.GRANTED_LABEL(resolvedScope)}
        </span>
        <span className="orch-text-muted" style={{ opacity: 0.4 }}>
          •
        </span>
        <span
          className="orch-text-muted orch-truncate"
          style={{ maxWidth: "24rem", fontSize: "0.625rem" }}
        >
          {request.target}
        </span>
      </div>
    );
  }

  const isCritical = request.isSensitive || request.riskLevel === ApprovalRiskLevel.CRITICAL;

  return (
    <div
      className={`orch-clearance-card ${
        isCritical ? "orch-clearance-card--critical" : "orch-clearance-card--warning"
      }`}
    >
      {/* Header */}
      <div
        className="orch-flex-row orch-justify-between"
        style={{ alignItems: "flex-start", gap: "0.75rem" }}
      >
        <div className="orch-flex-row orch-gap-sm" style={{ alignItems: "center" }}>
          <div
            style={{
              display: "grid",
              width: "1.75rem",
              height: "1.75rem",
              placeItems: "center",
              borderRadius: "var(--radius-md, 0.375rem)",
              backgroundColor: isCritical
                ? "color-mix(in oklab, var(--destructive) 15%, transparent)"
                : "color-mix(in oklab, var(--warning, #eab308) 15%, transparent)",
              color: isCritical ? "var(--destructive)" : "var(--warning, #eab308)",
            }}
          >
            <ShieldAlert style={{ width: "1rem", height: "1rem" }} />
          </div>
          <div>
            <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
              <span className="orch-font-semibold" style={{ fontSize: "0.875rem" }}>
                {isCritical
                  ? UI_COPY.STUDIO.CLEARANCE.TITLE_SENSITIVE
                  : UI_COPY.STUDIO.CLEARANCE.TITLE_SECURITY}
              </span>
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
                {request.tool}
              </Badge>
              {isCritical && (
                <Badge
                  variant="destructive"
                  style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  {UI_COPY.STUDIO.CLEARANCE.PROTECTED_FILE}
                </Badge>
              )}
            </div>
            <p
              className="orch-text-muted"
              style={{ margin: 0, marginTop: "0.125rem", fontSize: "0.75rem" }}
            >
              {request.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Target Path or Command Display */}
      <div className="orch-clearance-target">
        <div
          className="orch-text-muted"
          style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase" }}
        >
          {UI_COPY.STUDIO.CLEARANCE.REQUESTED_TARGET}
        </div>
        <div
          style={{
            marginTop: "0.25rem",
            fontWeight: 500,
            wordBreak: "break-all",
            userSelect: "all",
          }}
        >
          {request.target}
        </div>
      </div>

      {/* 3-Tier Action Buttons */}
      <div
        className="orch-flex-row orch-gap-xs"
        style={{ flexWrap: "wrap", alignItems: "center", paddingTop: "0.25rem" }}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.ONCE)}
          style={{ height: "1.75rem", gap: "0.375rem", fontSize: "0.75rem" }}
        >
          <Clock style={{ width: "0.75rem", height: "0.75rem" }} />
          <span>{UI_COPY.STUDIO.CLEARANCE.ALLOW_ONCE}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.SESSION)}
          style={{ height: "1.75rem", gap: "0.375rem", fontSize: "0.75rem" }}
        >
          <ShieldCheck
            className="orch-text-primary"
            style={{ width: "0.75rem", height: "0.75rem" }}
          />
          <span>{UI_COPY.STUDIO.CLEARANCE.ALLOW_THIS_CHAT}</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.PERMANENT)}
          style={{ height: "1.75rem", gap: "0.375rem", fontSize: "0.75rem" }}
        >
          <CheckCheck style={{ width: "0.75rem", height: "0.75rem" }} />
          <span>{UI_COPY.STUDIO.CLEARANCE.ALWAYS_ALLOW}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={submittingScope !== null}
          onClick={() => handleAction(PermissionScope.DENY)}
          className="orch-text-destructive"
          style={{ marginLeft: "auto", height: "1.75rem", gap: "0.375rem", fontSize: "0.75rem" }}
        >
          <X style={{ width: "0.75rem", height: "0.75rem" }} />
          <span>{UI_COPY.STUDIO.CLEARANCE.DENY}</span>
        </Button>
      </div>
    </div>
  );
}
