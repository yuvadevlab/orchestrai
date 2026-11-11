"use client";

/**
 * @file apps/console/src/features/settings/components/account-session-card.tsx
 * @description Operator account profile and session management panel with clean layout and copyable tenant ID.
 * @module apps/console/features/settings
 */

import React, { useState } from "react";
import { Panel, Button, Badge } from "@orchestrai/ui";
import { LogOut, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Clean account profile and session security panel with properly aligned sign out actions.
 */
export function AccountSessionCard(): React.JSX.Element {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState<boolean>(false);

  const tenantId = user?.tenantId || "Unassigned";

  const handleCopyTenant = (): void => {
    navigator.clipboard.writeText(tenantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Panel
      title={UI_COPY.SETTINGS.ACCOUNT.TITLE}
      meta={
        <Badge
          variant="outline"
          className="orch-font-mono"
          style={{
            borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
            color: "var(--primary)",
            fontSize: "0.625rem",
          }}
        >
          {UI_COPY.SETTINGS.ACCOUNT.BADGE_ACTIVE}
        </Badge>
      }
    >
      <div className="orch-flex-col orch-gap-md">
        <div
          className="orch-flex-row orch-gap-md"
          style={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <span className="orch-account-avatar">
            {getInitials(user?.name || user?.email, "OP")}
          </span>
          <div style={{ minWidth: 0 }}>
            <p className="orch-font-semibold" style={{ margin: 0, fontSize: "0.875rem" }}>
              {user?.name || UI_COPY.SETTINGS.ACCOUNT.FALLBACK_OPERATOR}
            </p>
            <p
              className="orch-text-muted orch-font-mono"
              style={{ margin: 0, fontSize: "0.6875rem" }}
            >
              {user?.email || ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="orch-font-mono"
            style={{ marginLeft: "auto", cursor: "pointer", gap: "0.375rem", fontSize: "0.75rem" }}
          >
            <LogOut style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>{UI_COPY.SETTINGS.ACCOUNT.SIGN_OUT_SESSION}</span>
          </Button>
        </div>

        <dl className="orch-account-dl">
          <div
            className="orch-flex-row orch-justify-between orch-gap-md"
            style={{
              borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
              paddingBottom: "0.375rem",
            }}
          >
            <dt className="orch-text-muted">{UI_COPY.SETTINGS.ACCOUNT.SESSION_STATE}</dt>
            <dd className="orch-font-medium" style={{ margin: 0 }}>
              {UI_COPY.SETTINGS.ACCOUNT.ACTIVE_SESSION}
            </dd>
          </div>
          <div className="orch-flex-row orch-justify-between orch-gap-md">
            <dt className="orch-text-muted">{UI_COPY.SETTINGS.ACCOUNT.TENANT_PARTITION}</dt>
            <dd
              className="orch-flex-row orch-gap-xs orch-font-mono"
              style={{ margin: 0, fontSize: "0.6875rem", alignItems: "center" }}
            >
              <span>{tenantId}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyTenant}
                className="orch-text-muted"
                style={{ width: "1.5rem", height: "1.5rem" }}
                title={UI_COPY.SETTINGS.ACCOUNT.COPY_TENANT_TOOLTIP}
                aria-label={UI_COPY.SETTINGS.ACCOUNT.COPY_TENANT_TOOLTIP}
              >
                {copied ? (
                  <Check
                    className="orch-text-primary"
                    style={{ width: "0.75rem", height: "0.75rem" }}
                  />
                ) : (
                  <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
                )}
              </Button>
            </dd>
          </div>
        </dl>
      </div>
    </Panel>
  );
}
