"use client";

/**
 * @file studio-header.tsx
 * @description Top control header for the Universal Cowork Studio with live database models and modes.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { BookOpen, History, Sidebar, Sparkles } from "lucide-react";
import { Button, Badge } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useConsoleStore } from "@/lib/stores";
import { useWorkspaceHarness } from "../api";
import { StudioWorkspaceSelector } from "./studio-workspace-selector";

export interface StudioHeaderProps {
  isRunning: boolean;
  onOpenHistory: () => void;
  onToggleRail: () => void;
  railOpen: boolean;
}

/**
 * Slim top bar for the Cowork Studio.
 * Hosts workspace folder switcher, session history threads, the swarm
 * status badge, and the inspector rail toggle.
 */
export function StudioHeader({
  isRunning,
  onOpenHistory,
  onToggleRail,
  railOpen,
}: StudioHeaderProps): React.JSX.Element {
  const activeWorkspace = useConsoleStore((s) => s.activeWorkspace);
  const { data: harness } = useWorkspaceHarness(activeWorkspace?.path);

  const totalHarnessSpecs = (harness?.rulesCount ?? 0) + (harness?.skillsCount ?? 0);

  return (
    <header className="orch-studio-header">
      {/* Left: Workspace Folder Picker & Session History Drawer Button */}
      <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
        <StudioWorkspaceSelector />

        {harness && totalHarnessSpecs > 0 && (
          <Badge
            variant="outline"
            className="orch-font-mono orch-text-primary"
            style={{
              borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
              backgroundColor: "color-mix(in oklab, var(--primary) 5%, transparent)",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.125rem 0.5rem",
              fontSize: "0.625rem",
            }}
            title={`Harness active: ${harness.rootInstructionsCount} root specs, ${harness.rulesCount} rules, ${harness.skillsCount} skills loaded from ${harness.workspaceRoot}`}
          >
            <BookOpen
              className="orch-text-primary"
              style={{ width: "0.75rem", height: "0.75rem" }}
            />
            <span>
              {harness.rulesCount} rules · {harness.skillsCount} skills
            </span>
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenHistory}
          className="orch-font-mono"
          style={{ height: "2rem", gap: "0.375rem", padding: "0 0.625rem", fontSize: "0.75rem" }}
          title={UI_COPY.STUDIO.HEADER.THREADS_TOOLTIP}
        >
          <History style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.STUDIO.HEADER.THREADS_BUTTON}</span>
        </Button>
      </div>

      {/* Right: Telemetry Badge & Inspector Action */}
      <div className="orch-flex-row orch-gap-xs" style={{ flexShrink: 0, alignItems: "center" }}>
        <Badge
          variant="outline"
          className="orch-font-mono"
          style={{
            gap: "0.375rem",
            padding: "0.125rem 0.5rem",
            fontSize: "0.625rem",
            textTransform: "uppercase",
            borderColor: isRunning
              ? "color-mix(in oklab, var(--primary) 40%, transparent)"
              : "var(--border)",
            backgroundColor: isRunning
              ? "color-mix(in oklab, var(--primary) 10%, transparent)"
              : "color-mix(in oklab, var(--secondary) 50%, transparent)",
            color: isRunning ? "var(--primary)" : "var(--mutedForeground)",
          }}
        >
          <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
          {isRunning
            ? UI_COPY.STUDIO.HEADER.STATUS_COLLABORATING
            : UI_COPY.STUDIO.HEADER.STATUS_READY}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleRail}
          style={{
            width: "2rem",
            height: "2rem",
            padding: 0,
            backgroundColor: railOpen ? "var(--accent)" : undefined,
            color: railOpen ? "var(--primary)" : undefined,
          }}
          title={UI_COPY.STUDIO.HEADER.TOGGLE_INSPECTOR_A11Y}
          aria-label={UI_COPY.STUDIO.HEADER.TOGGLE_INSPECTOR_A11Y}
        >
          <Sidebar style={{ width: "0.875rem", height: "0.875rem" }} />
        </Button>
      </div>
    </header>
  );
}
