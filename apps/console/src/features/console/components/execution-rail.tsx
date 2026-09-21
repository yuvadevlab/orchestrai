"use client";

/**
 * @fileoverview ExecutionRail — the right-side telemetry sidebar for the console.
 * Shows execution progress, current step, live metrics, and agent presence.
 * Styled exactly to the OrchestrAI Lovable reference.
 */

import React from "react";
import { CircleStop } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";

// ─── Metric ────────────────────────────────────────────────────────────────────

/**
 * A single numeric metric tile in the Live telemetry grid.
 */
function Metric({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}): React.JSX.Element {
  return (
    <div>
      <div
        className={cn("font-display text-xl font-semibold tabular-nums", accent && "text-primary")}
      >
        {value}
      </div>
      <div className="text-muted-foreground mt-0.5 font-mono text-[9px] tracking-[0.12em] uppercase">
        {label}
      </div>
    </div>
  );
}

// ─── Presence ──────────────────────────────────────────────────────────────────

/**
 * A single agent presence indicator row showing pulse dot, name, and current role.
 */
function Presence({
  name,
  role,
  active,
  warning = false,
}: {
  name: string;
  role: string;
  active: boolean;
  warning?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "bg-muted-foreground size-2 rounded-full",
          active && "animate-agent-pulse bg-primary",
          warning && "bg-warning",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium">{name}</div>
        <div className="text-muted-foreground font-mono text-[9px]">{role}</div>
      </div>
    </div>
  );
}

// ─── Execution Rail ────────────────────────────────────────────────────────────

/** Props for ExecutionRail. */
export interface ExecutionRailProps {
  progress: number;
  current: string;
  metrics: { tokens: string; tools: number; sources: number };
  elapsed: string;
  running: boolean;
  blocked: boolean;
  onStop: () => void;
}

/**
 * Right-side panel in the console layout.
 * Divided into: header / progress bar, current step, live telemetry, agent presence, stop button.
 */
export function ExecutionRail({
  progress,
  current,
  metrics,
  elapsed,
  running,
  blocked,
  onStop,
}: ExecutionRailProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      {/* Execution header + progress bar */}
      <div className="border-border border-b p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
            Execution
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">EXE-8F29A</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              blocked ? "bg-warning" : "bg-primary",
              running && "animate-agent-pulse",
            )}
          />
          <span className="font-display text-sm font-semibold">
            {blocked ? "Approval hold" : running ? "Running" : "Settled"}
          </span>
        </div>
        <div className="bg-border mt-3 h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-muted-foreground mt-1 flex justify-between font-mono text-[9px]">
          <span>adaptive · Qwen 8B</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Current step */}
      <div className="border-border border-b p-4">
        <div className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
          Currently
        </div>
        <p className="mt-2 text-sm leading-5">{current}</p>
      </div>

      {/* Live telemetry */}
      <div className="border-border border-b p-4">
        <div className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.16em] uppercase">
          Live telemetry
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Metric value={metrics.tokens} label="Tokens" />
          <Metric value={String(metrics.tools)} label="Tools" accent />
          <Metric value={String(metrics.sources)} label="Sources" />
          <Metric value={`${elapsed}s`} label="Duration" />
        </div>
      </div>

      {/* Agent presence — flex-1 fills remaining space */}
      <div className="min-h-0 flex-1 p-4">
        <div className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.16em] uppercase">
          Agent presence
        </div>
        <div className="space-y-3">
          <Presence name="Supervisor" role="Routing" active={running} />
          <Presence name="Research" role="Searching" active={running} />
          <Presence name="Developer" role="Inspecting" active={running} />
          <Presence
            name="Data"
            role={blocked ? "Approval hold" : "Analyzing"}
            active={!blocked && running}
            warning={blocked}
          />
        </div>
      </div>

      {/* Stop button */}
      <div className="p-4">
        <Button variant="outline" className="text-muted-foreground w-full" onClick={onStop}>
          <CircleStop className="size-3.5" />
          Stop execution
        </Button>
      </div>
    </div>
  );
}
