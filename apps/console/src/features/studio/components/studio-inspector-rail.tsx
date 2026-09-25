"use client";

/**
 * @file studio-inspector-rail.tsx
 * @description Inspector sidebar panel showing live SSE stream and runtime execution telemetry.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { Activity, X } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import type { StudioEvent } from "../types";

export interface StudioInspectorRailProps {
  events: StudioEvent[];
  isRunning: boolean;
  onClose?: () => void;
  activeExecutionId?: string;
}

/**
 * High-density sidebar displaying live SSE telemetry and audit logs with spacious layout.
 */
export function StudioInspectorRail({
  events,
  isRunning,
  onClose,
  activeExecutionId,
}: StudioInspectorRailProps): React.JSX.Element {
  const [tab, setTab] = useState<"stream" | "telemetry">("stream");

  return (
    <div className="border-border bg-card/60 flex size-full flex-col border-l font-mono text-xs backdrop-blur-md">
      {/* Spacious Header with ample top/bottom padding matching h-16 */}
      <div className="border-border/60 flex h-16 shrink-0 items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded-md">
            <Activity className="size-4" />
          </div>
          <div>
            <span className="text-foreground text-sm font-semibold tracking-tight">Inspector</span>
            <p className="text-muted-foreground mt-0.5 font-mono text-[10px] leading-none">
              Live Stream & Trace
            </p>
          </div>
        </div>

        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0 md:hidden">
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Tabs with generous padding */}
      <div className="border-border/40 bg-muted/20 flex border-b p-1.5 text-[11px]">
        <button
          type="button"
          onClick={() => setTab("stream")}
          className={`flex-1 rounded-md py-1.5 text-center font-medium transition-colors ${
            tab === "stream"
              ? "bg-card text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Live Stream ({events.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("telemetry")}
          className={`flex-1 rounded-md py-1.5 text-center font-medium transition-colors ${
            tab === "telemetry"
              ? "bg-card text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Telemetry
        </button>
      </div>

      {/* Body: Stream or Telemetry */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "stream" ? (
          <div className="space-y-2.5">
            {events.length === 0 ? (
              <div className="text-muted-foreground/60 py-12 text-center text-[11px]">
                {isRunning
                  ? "Awaiting first stream event..."
                  : "No live events in queue. State a goal to stream."}
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className="border-border/50 bg-background/50 rounded-md border p-3 text-[11px] shadow-2xs"
                >
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span className="text-primary font-semibold">{evt.agent}</span>
                    <span>{evt.meta}</span>
                  </div>
                  <p className="text-foreground mt-1 font-medium">{evt.title}</p>
                  {evt.detail && (
                    <p className="text-muted-foreground mt-1 text-[10px] leading-normal break-all">
                      {evt.detail}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="border-border/50 bg-background/50 rounded-md border p-3.5 shadow-2xs">
              <span className="text-muted-foreground text-[10px] uppercase">Execution Handle</span>
              <p className="text-foreground mt-1 truncate font-semibold">
                {activeExecutionId || "Idle"}
              </p>
            </div>

            <div className="border-border/50 bg-background/50 rounded-md border p-3.5 shadow-2xs">
              <span className="text-muted-foreground text-[10px] uppercase">Runtime Engine</span>
              <p className="text-foreground mt-1 font-semibold">
                Universal Swarm Coordinator (v1.0.0)
              </p>
            </div>

            <div className="border-border/50 bg-background/50 rounded-md border p-3.5 shadow-2xs">
              <span className="text-muted-foreground text-[10px] uppercase">Sandbox Status</span>
              <p className="mt-1 font-semibold text-emerald-400">Local-First Isolated Workspace</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
