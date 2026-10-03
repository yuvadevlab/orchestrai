"use client";

/**
 * @file apps/console/src/features/settings/components/settings-preferences-card.tsx
 * @description Theme preferences, default supervisor routing, and autonomous delegation controls.
 * @module apps/console/features/settings/components
 */

import React from "react";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@yuva-devlab/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { AgentDefinition } from "@/features/agents/types";

export interface SettingsPreferencesCardProps {
  theme?: string;
  setTheme: (theme: "light" | "dark" | "system") => void;
  selectedAgent: string;
  setSelectedAgent: (agentId: string) => void;
  agents: AgentDefinition[];
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  autonomy: boolean;
  setAutonomy: (enabled: boolean) => void;
}

/**
 * Preferences section card managing theme modes and orchestrator autonomy.
 */
export function SettingsPreferencesCard({
  theme,
  setTheme,
  selectedAgent,
  setSelectedAgent,
  agents,
  notifications,
  setNotifications,
  autonomy,
  setAutonomy,
}: SettingsPreferencesCardProps): React.JSX.Element {
  return (
    <section className="border-border bg-card/60 space-y-4 rounded-md border p-5 shadow-xs">
      <div>
        <h2 className="text-foreground text-sm font-semibold tracking-tight">
          {UI_COPY.SETTINGS.PREFERENCES.TITLE}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {UI_COPY.SETTINGS.PREFERENCES.DESCRIPTION}
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Theme Toggle */}
        <div className="border-border/60 flex items-center justify-between border-b pb-3">
          <div>
            <Label className="text-foreground text-xs font-medium">
              {UI_COPY.SETTINGS.PREFERENCES.THEME_LABEL}
            </Label>
            <p className="text-muted-foreground text-[11px]">
              {UI_COPY.SETTINGS.PREFERENCES.THEME_DESC}
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
            <Label className="text-foreground text-xs font-medium">
              {UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_LABEL}
            </Label>
            <p className="text-muted-foreground text-[11px]">
              {UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_DESC}
            </p>
          </div>
          <Select
            value={selectedAgent || "__auto"}
            onValueChange={(v) => setSelectedAgent(v === "__auto" ? "" : v)}
          >
            <SelectTrigger className="border-border bg-background h-8 w-48 text-xs font-medium">
              <SelectValue placeholder={UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground text-xs">
              <SelectItem value="__auto" className="cursor-pointer text-xs">
                {UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_PLACEHOLDER}
              </SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id} className="cursor-pointer text-xs">
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notifications Toggle */}
        <div className="border-border/60 flex items-center justify-between border-b pb-3">
          <div>
            <Label className="text-foreground text-xs font-medium">
              {UI_COPY.SETTINGS.PREFERENCES.NOTIFICATIONS_LABEL}
            </Label>
            <p className="text-muted-foreground text-[11px]">
              {UI_COPY.SETTINGS.PREFERENCES.NOTIFICATIONS_DESC}
            </p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        {/* Autonomous Delegation */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-foreground text-xs font-medium">
              {UI_COPY.SETTINGS.PREFERENCES.AUTONOMY_LABEL}
            </Label>
            <p className="text-muted-foreground text-[11px]">
              {UI_COPY.SETTINGS.PREFERENCES.AUTONOMY_DESC}
            </p>
          </div>
          <Switch checked={autonomy} onCheckedChange={setAutonomy} />
        </div>
      </div>
    </section>
  );
}
