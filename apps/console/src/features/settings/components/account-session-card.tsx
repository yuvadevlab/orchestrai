"use client";

/**
 * @file apps/console/src/features/settings/components/account-session-card.tsx
 * @description Operator account profile and session management panel with clean layout and copyable tenant ID.
 * @module apps/console/features/settings
 */

import React, { useState } from "react";
import { Panel, Button, Badge } from "@yuva-devlab/ui";
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
          className="border-primary/30 bg-primary/10 text-primary font-mono text-[10px]"
        >
          {UI_COPY.SETTINGS.ACCOUNT.BADGE_ACTIVE}
        </Badge>
      }
      className="md:col-span-2"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="border-primary/30 bg-primary/10 font-display text-primary grid size-12 shrink-0 place-items-center rounded-md border text-base font-semibold shadow-xs">
            {getInitials(user?.name || user?.email, "OP")}
          </span>
          <div className="min-w-0">
            <p className="font-display text-foreground text-sm font-semibold">
              {user?.name || UI_COPY.SETTINGS.ACCOUNT.FALLBACK_OPERATOR}
            </p>
            <p className="text-muted-foreground font-mono text-[11px]">{user?.email || ""}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-border hover:border-destructive/40 hover:text-destructive ml-auto cursor-pointer gap-1.5 font-mono text-xs"
          >
            <LogOut className="size-3.5" />
            <span>{UI_COPY.SETTINGS.ACCOUNT.SIGN_OUT_SESSION}</span>
          </Button>
        </div>

        <dl className="border-border/60 grid gap-2.5 border-t pt-3.5 text-xs sm:grid-cols-2">
          <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-1.5 sm:border-b-0 sm:pb-0">
            <dt className="text-muted-foreground">{UI_COPY.SETTINGS.ACCOUNT.SESSION_STATE}</dt>
            <dd className="text-foreground font-medium">
              {UI_COPY.SETTINGS.ACCOUNT.ACTIVE_SESSION}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{UI_COPY.SETTINGS.ACCOUNT.TENANT_PARTITION}</dt>
            <dd className="text-foreground flex items-center gap-1.5 font-mono text-[11px]">
              <span>{tenantId}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyTenant}
                className="text-muted-foreground hover:text-foreground size-6"
                title={UI_COPY.SETTINGS.ACCOUNT.COPY_TENANT_TOOLTIP}
                aria-label={UI_COPY.SETTINGS.ACCOUNT.COPY_TENANT_TOOLTIP}
              >
                {copied ? <Check className="text-primary size-3" /> : <Copy className="size-3" />}
              </Button>
            </dd>
          </div>
        </dl>
      </div>
    </Panel>
  );
}
