"use client";

/**
 * @fileoverview ExecutionTopology — animated DAG visualization of live agent execution.
 * Key design decisions:
 * - All icons explicitly constrained to 12px (`size-3` & `[&_svg]:size-3`)
 * - Specialists flow in a horizontal flex-row layout (`flex items-center gap-3`)
 * - Contained in an overflow-x-auto card with subtle dot-matrix background
 */

import React from "react";
import { Check, Code2, Database, Network, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventStatus } from "../console-data";

/**
 * A single agent node in the execution DAG diagram.
 */
function TopologyNode({
  title,
  subtitle,
  state,
  icon,
}: {
  title: string;
  subtitle: string;
  state: EventStatus | "idle";
  icon: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        "bg-secondary/85 w-36 shrink-0 rounded-lg border px-3 py-2.5 transition-colors",
        state === "active" && "border-primary/50 bg-primary/5",
        state === "waiting" && "border-warning/50 bg-warning/5",
        state === "done" && "border-primary/25",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "bg-muted text-muted-foreground grid size-6 shrink-0 place-items-center rounded-md",
            state === "active" && "bg-primary/15 text-primary",
            state === "waiting" && "bg-warning/15 text-warning",
          )}
        >
          {state === "done" ? <Check className="size-3" /> : icon}
        </span>
        <span className="truncate text-xs font-semibold">{title}</span>
      </div>

      <div className="text-muted-foreground mt-1.5 font-mono text-[9px]">{subtitle}</div>

      <div className="bg-border mt-2 h-1 overflow-hidden rounded-full">
        <div
          className={cn(
            "bg-muted-foreground h-full transition-all duration-500",
            state === "done" && "bg-primary/60 w-full",
            state === "active" && "animate-progress-flow bg-primary w-2/3",
            state === "waiting" && "bg-warning w-1/2",
            state === "idle" && "w-0",
          )}
        />
      </div>
    </div>
  );
}

/**
 * Animated signal pulse connecting two topology nodes along the execution path.
 */
function SignalLine({ active }: { active: boolean }): React.JSX.Element {
  return (
    <div className="bg-border relative mx-2 h-px min-w-10 flex-1">
      <span
        className={cn(
          "bg-muted-foreground absolute top-1/2 size-2 -translate-y-1/2 rounded-full opacity-0",
          active && "animate-signal-travel bg-primary opacity-100",
        )}
      />
    </div>
  );
}

/**
 * The live execution topology diagram rendered above the event log.
 */
export function ExecutionTopology({
  visibleCount = 0,
  blocked = false,
  completed = false,
}: {
  visibleCount?: number;
  blocked?: boolean;
  completed?: boolean;
}): React.JSX.Element {
  return (
    <section className="relative shrink-0 px-4 pb-4 md:px-5">
      <div className="border-border bg-card/75 relative overflow-x-auto rounded-lg border p-4">
        <div className="topology-grid pointer-events-none absolute inset-0 opacity-50" />

        <div className="relative mx-auto flex min-w-180 items-center justify-between">
          <TopologyNode
            title="Supervisor"
            subtitle="intent · planner"
            state={visibleCount > 0 ? "done" : "idle"}
            icon={<Network className="size-3" />}
          />
          <SignalLine active={visibleCount > 1} />

          <div className="flex items-center gap-3">
            <TopologyNode
              title="Research"
              subtitle="search · web"
              state={visibleCount > 2 ? (completed ? "done" : "active") : "idle"}
              icon={<Search className="size-3" />}
            />
            <TopologyNode
              title="Developer"
              subtitle="files · git"
              state={visibleCount > 3 ? (completed ? "done" : "active") : "idle"}
              icon={<Code2 className="size-3" />}
            />
            <TopologyNode
              title="Data"
              subtitle="sql · analysis"
              state={
                blocked ? "waiting" : visibleCount > 4 ? (completed ? "done" : "active") : "idle"
              }
              icon={<Database className="size-3" />}
            />
          </div>

          <SignalLine active={visibleCount > 4 && !blocked} />

          <TopologyNode
            title="Synthesis"
            subtitle="compose · cite"
            state={completed ? "done" : visibleCount > 5 && !blocked ? "active" : "idle"}
            icon={<Sparkles className="size-3" />}
          />
        </div>
      </div>
    </section>
  );
}
