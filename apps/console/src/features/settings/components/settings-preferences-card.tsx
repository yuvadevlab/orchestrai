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
} from "@orchestrai/ui";
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
    <section className="orch-settings-section">
      <div className="orch-settings-section-header">
        <h2 className="orch-settings-section-title">{UI_COPY.SETTINGS.PREFERENCES.TITLE}</h2>
        <p className="orch-settings-section-desc">{UI_COPY.SETTINGS.PREFERENCES.DESCRIPTION}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.75rem" }}>
        {/* Theme Toggle */}
        <div className="orch-settings-row">
          <div>
            <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.SETTINGS.PREFERENCES.THEME_LABEL}
            </Label>
            <p className="orch-text-muted" style={{ margin: 0, fontSize: "0.6875rem" }}>
              {UI_COPY.SETTINGS.PREFERENCES.THEME_DESC}
            </p>
          </div>
          <div className="orch-flex-row orch-gap-xs">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={theme === t ? "default" : "outline"}
                onClick={() => setTheme(t)}
                style={{
                  height: "1.75rem",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Default Specialist */}
        <div className="orch-settings-row">
          <div>
            <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_LABEL}
            </Label>
            <p className="orch-text-muted" style={{ margin: 0, fontSize: "0.6875rem" }}>
              {UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_DESC}
            </p>
          </div>
          <Select
            value={selectedAgent || "__auto"}
            onValueChange={(v) => setSelectedAgent(v === "__auto" ? "" : v)}
          >
            <SelectTrigger
              style={{ height: "2rem", width: "12rem", fontSize: "0.75rem", fontWeight: 500 }}
            >
              <SelectValue placeholder={UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__auto" style={{ cursor: "pointer", fontSize: "0.75rem" }}>
                {UI_COPY.SETTINGS.PREFERENCES.DEFAULT_AGENT_PLACEHOLDER}
              </SelectItem>
              {agents.map((a) => (
                <SelectItem
                  key={a.id}
                  value={a.id}
                  style={{ cursor: "pointer", fontSize: "0.75rem" }}
                >
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notifications Toggle */}
        <div className="orch-settings-row">
          <div>
            <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.SETTINGS.PREFERENCES.NOTIFICATIONS_LABEL}
            </Label>
            <p className="orch-text-muted" style={{ margin: 0, fontSize: "0.6875rem" }}>
              {UI_COPY.SETTINGS.PREFERENCES.NOTIFICATIONS_DESC}
            </p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        {/* Autonomous Delegation */}
        <div className="orch-settings-row">
          <div>
            <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.SETTINGS.PREFERENCES.AUTONOMY_LABEL}
            </Label>
            <p className="orch-text-muted" style={{ margin: 0, fontSize: "0.6875rem" }}>
              {UI_COPY.SETTINGS.PREFERENCES.AUTONOMY_DESC}
            </p>
          </div>
          <Switch checked={autonomy} onCheckedChange={setAutonomy} />
        </div>
      </div>
    </section>
  );
}
