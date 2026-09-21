"use client";

/**
 * @fileoverview ConsoleHeader — shrink-0 header for the Live Agent Console.
 * Contains: status pill, pause/resume, command input bar, and execution rail toggle.
 */

import React from "react";
import { PanelRightOpen, Pause, Play, Send } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";

export interface ConsoleHeaderProps {
  prompt: string;
  running: boolean;
  completed: boolean;
  isBlocked: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onToggleRunning: () => void;
  onOpenRail: () => void;
}

/**
 * Fixed top header for the console. Never scrolls (`shrink-0`).
 * Contains command input bar and running status controls.
 */
export function ConsoleHeader({
  prompt,
  running,
  completed,
  isBlocked,
  onPromptChange,
  onSubmit,
  onToggleRunning,
  onOpenRail,
}: ConsoleHeaderProps): React.JSX.Element {
  return (
    <header className="border-border bg-background/95 shrink-0 border-b px-3 py-2 backdrop-blur md:px-5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="font-display text-sm font-semibold">OrchestrAI</span>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            / Console / <span className="font-mono">topology-live</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="border-primary/25 bg-primary/8 text-primary inline-flex h-7 items-center gap-2 rounded-md border px-2.5 font-mono text-[10px]">
            <span
              className={cn(
                "bg-primary size-1.5 rounded-full",
                running && !completed && "animate-agent-pulse",
              )}
            />
            {completed ? "Complete" : isBlocked ? "Paused" : running ? "Orchestrating" : "Idle"}
          </span>
          <Button variant="outline" size="sm" onClick={onOpenRail} className="md:hidden">
            <PanelRightOpen className="size-3.5" /> Run
          </Button>
          <Button size="sm" onClick={onToggleRunning}>
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="border-border bg-secondary flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3">
          <span className="text-primary">›</span>
          <input
            aria-label="Command OrchestrAI"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className="placeholder:text-muted-foreground h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
            placeholder="State an objective…"
          />
          <Button size="icon" variant="ghost" aria-label="Run command" onClick={onSubmit}>
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
