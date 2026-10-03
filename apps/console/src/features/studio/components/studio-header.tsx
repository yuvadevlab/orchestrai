"use client";

/**
 * @file studio-header.tsx
 * @description Top control header for the Universal Cowork Studio with live database models and modes.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { BookOpen, History, Sidebar, Sparkles } from "lucide-react";
import { Button, Badge } from "@yuva-devlab/ui";
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
    <header className="border-border bg-card/60 relative z-20 flex h-13 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md">
      {/* Left: Workspace Folder Picker & Session History Drawer Button */}
      <div className="flex items-center gap-2">
        <StudioWorkspaceSelector />

        {harness && totalHarnessSpecs > 0 && (
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary hidden items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] md:inline-flex"
            title={`Harness active: ${harness.rootInstructionsCount} root specs, ${harness.rulesCount} rules, ${harness.skillsCount} skills loaded from ${harness.workspaceRoot}`}
          >
            <BookOpen className="text-primary size-3" />
            <span>
              {harness.rulesCount} rules · {harness.skillsCount} skills
            </span>
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenHistory}
          className="h-8 gap-1.5 px-2.5 font-mono text-xs"
          title={UI_COPY.STUDIO.HEADER.THREADS_TOOLTIP}
        >
          <History className="size-3.5" />
          <span className="hidden sm:inline">{UI_COPY.STUDIO.HEADER.THREADS_BUTTON}</span>
        </Button>
      </div>

      {/* Right: Telemetry Badge & Inspector Action */}
      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant="outline"
          className={`gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase ${
            isRunning
              ? "border-primary/40 bg-primary/10 text-primary animate-pulse"
              : "border-border bg-secondary/50 text-muted-foreground"
          }`}
        >
          <Sparkles className="size-3" />
          {isRunning
            ? UI_COPY.STUDIO.HEADER.STATUS_COLLABORATING
            : UI_COPY.STUDIO.HEADER.STATUS_READY}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleRail}
          className={`size-8 p-0 ${railOpen ? "bg-accent text-primary" : ""}`}
          title={UI_COPY.STUDIO.HEADER.TOGGLE_INSPECTOR_A11Y}
          aria-label={UI_COPY.STUDIO.HEADER.TOGGLE_INSPECTOR_A11Y}
        >
          <Sidebar className="size-3.5" />
        </Button>
      </div>
    </header>
  );
}
