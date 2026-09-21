"use client";

/**
 * @fileoverview ConsoleEventLog — flex-1 scrollable event stream section.
 */

import React, { type RefObject } from "react";
import { Button } from "@yuva-devlab/ui";
import { ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityRunner } from "./activity-runner";
import type { EventStatus, ExecutionEvent } from "../console-data";

export interface ConsoleEventLogProps {
  events: ExecutionEvent[];
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
 */
export function ConsoleEventLog({
  events = [],
  visibleCount,
  running,
  completed,
  isBlocked,
  currentEventTitle,
  newActivity,
  streamedResponse,
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
            ? "Waiting for operator approval"
            : completed
              ? "Execution complete"
              : (currentEventTitle ?? "Awaiting signals")}
        </span>
        <span className="text-muted-foreground ml-auto hidden font-mono text-[10px] sm:block">
          {visibleCount}/{events.length} events
        </span>
      </div>

      <div
        ref={activityRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 md:px-5"
      >
        <div className="mx-auto max-w-4xl space-y-2">
          {events.slice(0, visibleCount).map((event: ExecutionEvent, i: number) => (
            <ActivityRunner
              key={event.id}
              event={event}
              status={statusFor(i)}
              expanded={expanded === event.id}
              onToggle={() => onToggleExpand(event.id)}
            />
          ))}

          {isBlocked && (
            <div className="runner-enter border-warning/45 bg-warning/8 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-warning/15 text-warning grid size-8 shrink-0 place-items-center rounded-md">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold">Approval required</div>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    Agent requests permission to execute step. Approve to proceed.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-warning text-warning-foreground hover:bg-warning/90"
                      onClick={onApprove}
                    >
                      Approve & Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {streamedResponse && (
            <div className="border-border bg-card rounded-lg border p-4 font-mono text-xs leading-relaxed">
              <div className="text-primary mb-2 flex items-center gap-1.5 font-bold">
                <Sparkles className="size-3.5" />
                <span>Agent Output Stream</span>
              </div>
              <p className="whitespace-pre-wrap">{streamedResponse}</p>
            </div>
          )}
        </div>
      </div>

      {newActivity && (
        <div className="absolute right-6 bottom-4 z-20">
          <Button size="sm" onClick={onScrollToBottom} className="gap-1.5 text-xs shadow-lg">
            <span>New Activity</span>
            <ChevronDown className="size-3.5" />
          </Button>
        </div>
      )}
    </section>
  );
}
