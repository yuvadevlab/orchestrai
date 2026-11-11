"use client";

/**
 * @file apps/console/src/features/settings/components/settings-api-keys-card.tsx
 * @description API Keys and integration tokens settings section.
 * @module apps/console/features/settings/components
 */

import React from "react";
import { Input, Label } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface SettingsApiKeysCardProps {
  apiKeys: Record<string, string>;
  onKeyChange: (provider: string, val: string) => void;
}

/**
 * API keys management card allowing workspace operators to configure inference provider tokens.
 */
export function SettingsApiKeysCard({
  apiKeys,
  onKeyChange,
}: SettingsApiKeysCardProps): React.JSX.Element {
  return (
    <section className="orch-settings-section">
      <div className="orch-settings-section-header">
        <h2 className="orch-settings-section-title">{UI_COPY.SETTINGS.API_KEYS.TITLE}</h2>
        <p className="orch-settings-section-desc">{UI_COPY.SETTINGS.API_KEYS.DESCRIPTION}</p>
      </div>

      <div className="orch-settings-keys-list">
        {Object.keys(apiKeys).map((p) => (
          <div key={p} className="orch-settings-key-item">
            <Label className="orch-text-muted" style={{ width: "7rem", fontSize: "0.75rem" }}>
              {p}
            </Label>
            <Input
              type="password"
              placeholder={UI_COPY.SETTINGS.API_KEYS.PLACEHOLDER}
              value={apiKeys[p]}
              onChange={(e) => onKeyChange(p, e.target.value)}
              className="orch-font-mono"
              style={{ flex: 1, height: "2rem", fontSize: "0.75rem", width: "100%" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
