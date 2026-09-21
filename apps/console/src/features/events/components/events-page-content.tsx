"use client";

/**
 * @file events-page-content.tsx
 * @description Real-time system event log with interactive JSON payload inspection and EmptyState support.
 * @module apps/console/features/events
 */

import React, { useState } from "react";
import { StatusChip } from "@yuva-devlab/ui";
import { Radio } from "lucide-react";
import { useEvents } from "@/features/events/api";
import { EmptyState } from "@/components/ui/empty-state";

import type { SystemEvent } from "@/lib/types";

export function EventsPageContent(): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: systemEvents, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
        <span className="text-muted-foreground animate-pulse font-mono text-xs">
          Connecting to event bus...
        </span>
      </div>
    );
  }

  if (systemEvents.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        title="No Events Emitted"
        description="Outbox signals, execution lifecycle events, and worker status updates will stream here."
      />
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border">
      {systemEvents.map((event: SystemEvent) => (
        <div key={event.id} className="border-border/60 border-b last:border-0">
          <button
            type="button"
            onClick={() => setOpenId((curr) => (curr === event.id ? null : event.id))}
            className="hover:bg-accent/40 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
          >
            <span className="text-primary font-mono text-[11px] font-semibold">{event.type}</span>
            <span className="text-muted-foreground hidden font-mono text-[10px] sm:inline">
              {event.source}
            </span>
            <span className="text-muted-foreground hidden font-mono text-[10px] md:inline">
              {event.executionId}
            </span>
            <span className="text-muted-foreground ml-auto font-mono text-[10px]">{event.at}</span>
            <StatusChip status={event.status} />
          </button>
          {openId === event.id ? (
            <pre className="border-border bg-background/90 text-muted-foreground overflow-x-auto border-t p-4 font-mono text-[10px] leading-relaxed">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          ) : null}
        </div>
      ))}
    </div>
  );
}
