"use client";

/**
 * @file settings-page-content.tsx
 * @description Workspace settings page following orchestrai-src layout — profile, API keys, and preferences.
 * @module apps/console/features/settings
 */

import React, { useState } from "react";
import { Button, useTheme, toast } from "@yuva-devlab/ui";
import { PageShell } from "@/components/layout/page-shell";
import { useAuth } from "@/lib/auth";
import { useAgents } from "@/features/agents/api";
import { UI_COPY } from "@/lib/ui-copy";
import { SettingsApiKeysCard } from "./settings-api-keys-card";
import { SettingsProfileCard } from "./settings-profile-card";
import { SettingsPreferencesCard } from "./settings-preferences-card";

/**
 * Settings page content matching orchestrai-src reference UI.
 */
export function SettingsPageContent(): React.JSX.Element {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: agents = [] } = useAgents();

  const [name, setName] = useState(user?.name || UI_COPY.SETTINGS.ACCOUNT.FALLBACK_OPERATOR);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [notifications, setNotifications] = useState(true);
  const [autonomy, setAutonomy] = useState(true);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    Anthropic: "",
    "Google AI": "",
    OpenAI: "",
    DeepSeek: "",
    Groq: "",
  });

  const handleKeyChange = (provider: string, val: string): void => {
    setApiKeys((prev) => ({ ...prev, [provider]: val }));
  };

  const handleSave = (): void => {
    const savePromise = new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => resolve({ success: true }), 600);
    });

    toast.promise(savePromise, {
      loading: UI_COPY.SETTINGS.TOAST.SAVING,
      success: UI_COPY.SETTINGS.TOAST.SAVED,
      error: UI_COPY.SETTINGS.TOAST.ERROR,
    });
  };

  return (
    <PageShell
      title={UI_COPY.SETTINGS.PAGE_TITLE}
      breadcrumb={UI_COPY.SETTINGS.BREADCRUMB}
      description={UI_COPY.SETTINGS.PAGE_DESCRIPTION}
      actions={
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          className="h-8 cursor-pointer text-xs font-medium"
        >
          {UI_COPY.SETTINGS.SAVE_BUTTON}
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-3xl space-y-5">
        {/* Profile Card */}
        <SettingsProfileCard name={name} onNameChange={setName} user={user} />

        {/* API Keys & Integration Tokens */}
        <SettingsApiKeysCard apiKeys={apiKeys} onKeyChange={handleKeyChange} />

        {/* Preferences */}
        <SettingsPreferencesCard
          theme={theme}
          setTheme={setTheme}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          agents={agents}
          notifications={notifications}
          setNotifications={setNotifications}
          autonomy={autonomy}
          setAutonomy={setAutonomy}
        />
      </div>
    </PageShell>
  );
}
