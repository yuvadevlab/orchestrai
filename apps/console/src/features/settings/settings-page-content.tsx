"use client";

import React, { useState } from "react";
import { Badge } from "@yuva-devlab/ui";
import { DatabaseSettings } from "./components/database-settings";
import { SecuritySettings } from "./components/security-settings";
import type { SystemSettingsConfig } from "./types";

const INITIAL_SETTINGS: SystemSettingsConfig = {
  databaseUri: "postgresql://postgres:postgres@localhost:5432/orchestrai",
  enableOutboxPoller: true,
  maxTimeoutSeconds: 300,
  maxRetryLimit: 3,
};

/**
 * Main feature container view for System Settings.
 */
export function SettingsPageContent(): React.JSX.Element {
  const [settings, setSettings] = useState<SystemSettingsConfig>(INITIAL_SETTINGS);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Console Settings</h1>
            <Badge variant="outline" className="font-mono text-xs">
              Local Environment
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Configure local runtime endpoints, persistence flags, and API gateway keys.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <DatabaseSettings
          databaseUri={settings.databaseUri}
          outboxEnabled={settings.enableOutboxPoller}
          onOutboxChange={(checked) =>
            setSettings((prev) => ({ ...prev, enableOutboxPoller: checked }))
          }
        />
        <SecuritySettings
          maxTimeoutSeconds={settings.maxTimeoutSeconds}
          maxRetryLimit={settings.maxRetryLimit}
        />
      </div>
    </div>
  );
}
