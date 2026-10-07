"use client";

/**
 * @file apps/console/src/features/settings/components/settings-api-keys-card.tsx
 * @description API Keys and integration tokens settings section.
 * @module apps/console/features/settings/components
 */

import React from "react";
import { Input, Label } from "@yuva-devlab/ui";
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
    <section className="border-border bg-card/60 space-y-4 rounded-md border p-5 shadow-xs">
      <div>
        <h2 className="text-foreground text-sm font-semibold tracking-tight">
          {UI_COPY.SETTINGS.API_KEYS.TITLE}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {UI_COPY.SETTINGS.API_KEYS.DESCRIPTION}
        </p>
      </div>

      <div className="space-y-3">
        {Object.keys(apiKeys).map((p) => (
          <div
            key={p}
            className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3"
          >
            <Label className="text-muted-foreground w-28 text-xs">{p}</Label>
            <Input
              type="password"
              placeholder={UI_COPY.SETTINGS.API_KEYS.PLACEHOLDER}
              value={apiKeys[p]}
              onChange={(e) => onKeyChange(p, e.target.value)}
              className="bg-background h-8 flex-1 font-mono text-xs"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
