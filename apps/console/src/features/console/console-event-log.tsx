"use client";

/**
 * @fileoverview ConsoleEventLog — the flex-1 scrollable event stream section.
 * This is the ONLY part of the console that scrolls. Everything above it is
 * `shrink-0` (header, intent section, topology).
 *
 * Layout: `flex min-h-0 flex-1 flex-col border-t`
 *  - Status bar: `shrink-0`
 *  - Scroll div: `min-h-0 flex-1 overflow-y-auto`
 *    - Content: `mx-auto max-w-4xl` (centered — matching lovable)
 */

import React, { type RefObject } from "react";
import { Button } from "@yuva-devlab/ui";
import { ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityRunner } from "./activity-runner";
import type { DemoConfig, EventStatus, ExecutionEvent } from "./console-demo-data";

export interface ConsoleEventLogProps {
  config: DemoConfig;
  visibleCount: number;
  running: boolean;
  completed: boolean;
  isBlocked: boolean;
  currentEventTitle: string | undefined;
  newActivity: boolean;
  streamedResponse: string;
  responseWords: number;
  expanded: string | null;
  activityRef: RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onToggleExpand: (id: string) => void;
  onApprove: () => void;
  onScrollToBottom: () => void;
  statusFor: (index: number) => EventStatus;
}

/**
 * The scrollable event stream panel below the topology diagram.
 * Only this section has `overflow-y-auto` — the rest of the console is fixed.
 */
export function ConsoleEventLog({
  config,
  visibleCount,
  running,
  completed,
  isBlocked,
  currentEventTitle,
  newActivity,
  streamedResponse,
  responseWords,
  expanded,
  activityRef,
  onScroll,
  onToggleExpand,
  onApprove,
  onScrollToBottom,
  statusFor,
}: ConsoleEventLogProps): React.JSX.Element {
  return (
    <section className="border-border bg-background/75 relative flex min-h-0 flex-1 flex-col border-t">
      {/* "Currently" status bar — shrink-0 */}
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-2 md:px-5">
        <span
          className={cn(
            "bg-primary size-2 rounded-full",
            running && !completed && !isBlocked && "animate-agent-pulse",
          )}
        />
        <span className="text-xs font-semibold">Currently</span>
        <span className="text-muted-foreground truncate text-xs">
          {isBlocked
            ? "Waiting for database approval"
            : completed
              ? "Execution complete"
              : currentEventTitle}
        </span>
        <span className="text-muted-foreground ml-auto hidden font-mono text-[10px] sm:block">
          {visibleCount}/{config.events.length} events
        </span>
      </div>

      {/* Scrollable area — flex-1 overflow-y-auto */}
      <div
        ref={activityRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 md:px-5"
      >
        {/* max-w-4xl centers content — exact lovable match */}
        <div className="mx-auto max-w-4xl space-y-2">
          {config.events.slice(0, visibleCount).map((event: ExecutionEvent, i: number) => (
            <ActivityRunner
              key={event.id}
              event={event}
              status={statusFor(i)}
              expanded={expanded === event.id}
              onToggle={() => onToggleExpand(event.id)}
            />
          ))}

          {/* HITL Approval gate card */}
          {isBlocked && (
            <div className="runner-enter border-warning/45 bg-warning/8 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-warning/15 text-warning grid size-8 shrink-0 place-items-center rounded-md">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold">Approval required</div>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    Data Agent requests a read-only aggregate over performance traces. No record
                    contents will be displayed.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-warning text-warning-foreground hover:bg-warning/90"
                      onClick={onApprove}
                    >
                      Approve &amp; resume
                    </Button>
                    <Button size="sm" variant="outline">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streaming result card */}
          {responseWords > 0 && !isBlocked && (
            <div className="runner-enter border-primary bg-primary/5 border-l-2 px-4 py-3">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="text-primary size-3.5" />
                <span className="text-primary font-mono text-[10px] tracking-[0.14em] uppercase">
                  Result / streaming
                </span>
              </div>
              <p className="text-foreground text-sm leading-6">
                {streamedResponse}
                <span
                  className={cn(
                    "bg-primary ml-1 inline-block h-4 w-1 align-middle",
                    !completed && "animate-agent-pulse",
                  )}
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* "New activity" scroll-to-bottom button */}
      {newActivity && (
        <Button
          size="sm"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-xl"
          onClick={onScrollToBottom}
        >
          <ChevronDown /> New activity
        </Button>
      )}
    </section>
  );
}
