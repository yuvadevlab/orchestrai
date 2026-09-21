"use client";

/**
 * @fileoverview ActivityRunner — a single expandable event row in the console event log.
 * Styled exactly to the OrchestrAI Lovable reference.
 *
 * Key design decisions:
 * - Icon badge uses `[&_svg]:size-3.5` (child selector) matching lovable
 * - Button is full-width (`w-full`) but the wrapping scroll area constrains to `max-w-4xl`
 * - Expanded detail panel shows TRACE / RUNNER / STATE in a 3-column grid
 */

import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_ICONS } from "../console-data";
import type { EventStatus, ExecutionEvent } from "../console-data";

/**
 * Single expandable event row inside the console activity stream.
 */
export function ActivityRunner({
  event,
  status,
  expanded,
  onToggle,
}: {
  event: ExecutionEvent;
  status: EventStatus;
  expanded: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const Icon = EVENT_ICONS[event.type];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        /* [&_svg]:size-3.5 constrains child SVG icons to 14px — matches lovable */
        "runner-enter border-border bg-card hover:border-primary/30 w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
        status === "active" && "border-primary/45 bg-primary/5",
        status === "waiting" && "border-warning/45 bg-warning/5",
      )}
    >
      {/* Primary row: icon, title, agent, meta, chevron */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "bg-secondary text-muted-foreground grid size-6 shrink-0 place-items-center rounded-md",
            status === "active" && "bg-primary/15 text-primary",
            status === "waiting" && "bg-warning/15 text-warning",
          )}
        >
          {/* Check when done, animated icon when active */}
          {status === "done" ? (
            <Check className="size-3.5" />
          ) : (
            <Icon className={cn("size-3.5", status === "active" && "animate-agent-pulse")} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-xs font-semibold">{event.title}</span>
            <span className="text-muted-foreground hidden font-mono text-[9px] sm:inline">
              {event.agent}
            </span>
          </div>
          {/* Show detail only when not done, or when expanded */}
          {(status !== "done" || expanded) && (
            <p className="text-muted-foreground mt-1 truncate text-[11px]">{event.detail}</p>
          )}
        </div>

        {/* Meta timing label */}
        <span
          className={cn(
            "text-muted-foreground shrink-0 font-mono text-[9px]",
            status === "active" && "text-primary",
            status === "waiting" && "text-warning",
          )}
        >
          {event.meta}
        </span>

        {/* Expand/collapse chevron */}
        <ChevronDown
          className={cn(
            "text-muted-foreground size-3.5 shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </div>

      {/* Expanded detail grid: TRACE / RUNNER / STATE / full detail */}
      {expanded && (
        <div className="border-border mt-3 grid gap-2 border-t pt-3 pl-8 text-[10px] sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground font-mono">TRACE</span>
            <div className="mt-1 font-mono">tr_{event.id}_8f29</div>
          </div>
          <div>
            <span className="text-muted-foreground font-mono">RUNNER</span>
            <div className="mt-1 font-mono">{event.type}.execute</div>
          </div>
          <div>
            <span className="text-muted-foreground font-mono">STATE</span>
            <div className="mt-1 capitalize">{status}</div>
          </div>
          <p className="text-muted-foreground text-xs leading-5 sm:col-span-3">{event.detail}</p>
        </div>
      )}
    </button>
  );
}
