"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@yuva-devlab/ui";
import {
  Brain,
  ListTree,
  Search,
  Globe,
  FileCode,
  Database,
  Users,
  Cpu,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { ExecutionEvent } from "../types";

export interface EventStreamProps {
  events: ExecutionEvent[];
  isRunning: boolean;
}

/**
 * Resolves the contextual Lucide icon based on step execution type.
 */
function getEventIcon(type: ExecutionEvent["type"]): LucideIcon {
  switch (type) {
    case "think":
      return Brain;
    case "plan":
      return ListTree;
    case "search":
      return Search;
    case "web":
      return Globe;
    case "file":
      return FileCode;
    case "database":
      return Database;
    case "delegate":
      return Users;
    case "model":
      return Cpu;
    default:
      return Brain;
  }
}

/**
 * Live DAG Execution Event Stream.
 * Visualizes chronological agent steps, tool executions, and step latencies.
 */
export function EventStream({ events, isRunning }: EventStreamProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card flex h-full flex-col shadow-sm">
      <CardHeader className="border-border/60 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Execution Event Trace
            </CardTitle>
            <CardDescription className="text-muted-foreground font-mono text-xs">
              Live step stream emitted by BullMQ worker daemons
            </CardDescription>
          </div>

          <Badge variant="outline" className="font-mono text-xs">
            {events.length} Steps
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="border-border text-muted-foreground flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <Clock className="mb-2 size-6 opacity-50" />
            <p className="text-xs font-medium">No execution steps yet.</p>
            <p className="text-[11px]">Type a prompt or choose a scenario above to run.</p>
          </div>
        ) : (
          events.map((ev) => {
            const Icon = getEventIcon(ev.type);

            return (
              <div
                key={ev.id}
                className="border-border/70 bg-background/50 hover:border-border flex items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <div className="bg-primary/10 text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xs font-semibold">{ev.title}</span>
                      <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                        {ev.agent}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                      {ev.meta}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">{ev.detail}</p>
                </div>
              </div>
            );
          })
        )}

        {isRunning && (
          <div className="text-primary flex animate-pulse items-center gap-2 p-2 font-mono text-xs">
            <div className="bg-primary size-1.5 rounded-full" />
            <span>Worker executing active step...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
