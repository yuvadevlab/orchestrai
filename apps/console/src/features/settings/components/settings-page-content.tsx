"use client";

/**
 * @file settings-page-content.tsx
 * @description Workspace settings page following orchestrai-src layout — profile, API keys, and preferences.
 * @module apps/console/features/settings
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Label, Switch, useTheme } from "@yuva-devlab/ui";
import { PageShell } from "@/components/layout/page-shell";
import { useAuth } from "@/lib/auth";
import { useAgents } from "@/features/agents/api";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSectionCard({
  title,
  description,
  children,
}: SettingsCardProps): React.JSX.Element {
  return (
    <section className="border-border bg-card/60 space-y-4 rounded-md border p-5 shadow-xs">
      <div>
        <h2 className="text-foreground text-sm font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Settings page content matching orchestrai-src reference UI.
 */
export function SettingsPageContent(): React.JSX.Element {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: agents = [] } = useAgents();

  const [name, setName] = useState(user?.name || "Yuvaraj Pattabi");
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
      loading: "Saving workspace preferences...",
      success: "Settings saved successfully",
      error: "Failed to save settings",
    });
  };

  return (
    <PageShell
      title="Settings"
      breadcrumb="Settings"
      description="Your profile, keys and preferences."
      actions={
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          className="h-8 cursor-pointer text-xs font-medium"
        >
          Save changes
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-3xl space-y-5">
        {/* Profile Card */}
        <SettingsSectionCard
          title="Profile"
          description="Your user identity and tenancy permissions."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                value={user?.email || "yuvaraj@orchestrai.dev"}
                disabled
                className="bg-muted text-muted-foreground h-8 cursor-not-allowed text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Input
                value={user?.roles?.[0] || "Workspace Owner"}
                disabled
                className="bg-muted text-muted-foreground h-8 cursor-not-allowed text-xs capitalize"
              />
            </div>
          </div>
        </SettingsSectionCard>

        {/* API Keys & Integration Tokens */}
        <SettingsSectionCard
          title="API Keys & Integration Tokens"
          description="Bring your own provider keys for custom inference quotas and private routing."
        >
          <div className="space-y-3">
            {Object.keys(apiKeys).map((p) => (
              <div
                key={p}
                className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3"
              >
                <Label className="text-muted-foreground w-28 text-xs">{p}</Label>
                <Input
                  type="password"
                  placeholder="sk-••••••••"
                  value={apiKeys[p]}
                  onChange={(e) => handleKeyChange(p, e.target.value)}
                  className="bg-background h-8 flex-1 font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </SettingsSectionCard>

        {/* Preferences */}
        <SettingsSectionCard
          title="Preferences"
          description="Application appearance and supervisor delegation behavior."
        >
          <div className="space-y-4 text-xs">
            {/* Theme Toggle */}
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div>
                <Label className="text-foreground text-xs font-medium">Theme</Label>
                <p className="text-muted-foreground text-[11px]">
                  Select your preferred interface color mode.
                </p>
              </div>
              <div className="flex gap-1">
                {(["light", "dark", "system"] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={theme === t ? "default" : "outline"}
                    onClick={() => setTheme(t)}
                    className="h-7 cursor-pointer text-xs capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            {/* Default Specialist */}
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div>
                <Label className="text-foreground text-xs font-medium">Default specialist</Label>
                <p className="text-muted-foreground text-[11px]">
                  Primary agent targeted when starting new prompts.
                </p>
              </div>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="border-border bg-background text-foreground h-8 rounded-md border px-2.5 py-1 text-xs"
              >
                <option value="">Auto-route (Supervisor)</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications Toggle */}
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div>
                <Label className="text-foreground text-xs font-medium">
                  Notifications on run completion
                </Label>
                <p className="text-muted-foreground text-[11px]">
                  Receive in-app toast updates when background runs finish.
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            {/* Autonomous Delegation */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground text-xs font-medium">Autonomous delegation</Label>
                <p className="text-muted-foreground text-[11px]">
                  Allow orchestrator to recruit specialist agents without prompt confirmation.
                </p>
              </div>
              <Switch checked={autonomy} onCheckedChange={setAutonomy} />
            </div>
          </div>
        </SettingsSectionCard>
      </div>
    </PageShell>
  );
}
