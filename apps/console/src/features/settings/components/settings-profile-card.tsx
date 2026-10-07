"use client";

/**
 * @file apps/console/src/features/settings/components/settings-profile-card.tsx
 * @description Operator identity, workspace tenancy, and role classification card.
 * @module apps/console/features/settings/components
 */

import React from "react";
import { Input, Label } from "@yuva-devlab/ui";
import type { AuthUser } from "@/lib/auth";
import { UI_COPY } from "@/lib/ui-copy";

export interface SettingsProfileCardProps {
  name: string;
  onNameChange: (value: string) => void;
  user: AuthUser | null;
}

/**
 * User identity and tenancy configuration section card.
 */
export function SettingsProfileCard({
  name,
  onNameChange,
  user,
}: SettingsProfileCardProps): React.JSX.Element {
  return (
    <section className="border-border bg-card/60 space-y-4 rounded-md border p-5 shadow-xs">
      <div>
        <h2 className="text-foreground text-sm font-semibold tracking-tight">
          {UI_COPY.SETTINGS.PROFILE.TITLE}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {UI_COPY.SETTINGS.PROFILE.DESCRIPTION}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{UI_COPY.SETTINGS.PROFILE.NAME_LABEL}</Label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{UI_COPY.SETTINGS.PROFILE.EMAIL_LABEL}</Label>
          <Input
            value={user?.email || ""}
            disabled
            className="bg-muted text-muted-foreground h-8 cursor-not-allowed text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{UI_COPY.SETTINGS.PROFILE.ROLE_LABEL}</Label>
          <Input
            value={user?.roles?.[0] || ""}
            disabled
            className="bg-muted text-muted-foreground h-8 cursor-not-allowed text-xs capitalize"
          />
        </div>
      </div>
    </section>
  );
}
