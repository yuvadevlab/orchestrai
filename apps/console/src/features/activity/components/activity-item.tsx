import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ActivityEvent } from "../types";

/**
 * Props for ActivityItem component.
 */
export interface ActivityItemProps {
  /** Event entity */
  readonly event: ActivityEvent;
}

/**
 * Visual row item displaying a single telemetry audit event.
 */
export function ActivityItem({ event }: ActivityItemProps): React.JSX.Element {
  return (
    <div className="border-border/60 bg-background/50 flex items-center justify-between rounded-md border p-2.5 font-mono text-xs">
      <div className="flex items-center gap-3">
        {event.status === "SUCCESS" && <CheckCircle2 className="text-primary size-4 shrink-0" />}
        {event.status === "WARNING" && <AlertTriangle className="size-4 shrink-0 text-amber-500" />}
        {event.status === "FAILURE" && <XCircle className="text-destructive size-4 shrink-0" />}
        <span className="text-foreground font-semibold">{event.type}</span>
        <span className="text-muted-foreground">{event.detail}</span>
      </div>
      <span className="text-muted-foreground shrink-0">{event.time}</span>
    </div>
  );
}
