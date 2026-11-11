"use client";

/**
 * @file apps/console/src/features/settings/components/settings-profile-card.tsx
 * @description Operator identity, workspace tenancy, and role classification card.
 * @module apps/console/features/settings/components
 */

import React from "react";
import { Input, Label } from "@orchestrai/ui";
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
    <section className="orch-settings-section">
      <div className="orch-settings-section-header">
        <h2 className="orch-settings-section-title">{UI_COPY.SETTINGS.PROFILE.TITLE}</h2>
        <p className="orch-settings-section-desc">{UI_COPY.SETTINGS.PROFILE.DESCRIPTION}</p>
      </div>

      <div className="orch-settings-profile-grid">
        <div className="orch-flex-col orch-gap-xs">
          <Label style={{ fontSize: "0.75rem" }}>{UI_COPY.SETTINGS.PROFILE.NAME_LABEL}</Label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            style={{ height: "2rem", fontSize: "0.75rem" }}
          />
        </div>
        <div className="orch-flex-col orch-gap-xs">
          <Label style={{ fontSize: "0.75rem" }}>{UI_COPY.SETTINGS.PROFILE.EMAIL_LABEL}</Label>
          <Input
            value={user?.email || ""}
            disabled
            className="orch-text-muted"
            style={{ height: "2rem", fontSize: "0.75rem", cursor: "not-allowed" }}
          />
        </div>
        <div className="orch-flex-col orch-gap-xs">
          <Label style={{ fontSize: "0.75rem" }}>{UI_COPY.SETTINGS.PROFILE.ROLE_LABEL}</Label>
          <Input
            value={user?.roles?.[0] || ""}
            disabled
            className="orch-text-muted"
            style={{
              height: "2rem",
              fontSize: "0.75rem",
              cursor: "not-allowed",
              textTransform: "capitalize",
            }}
          />
        </div>
      </div>
    </section>
  );
}
