"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusChip } from "@yuva-devlab/ui";
import { systemEvents } from "@/lib/mock-db";

/**
 * Real-time event log with interactive JSON payload inspection.
 */
export default function EventsPage(): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <PageShell
      title="Event stream"
      breadcrumb="Events"
      description="Every signal the system emits. Expand a row for its raw JSON payload."
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        {systemEvents.map((event) => (
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
              <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                {event.at}
              </span>
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
    </PageShell>
  );
}
