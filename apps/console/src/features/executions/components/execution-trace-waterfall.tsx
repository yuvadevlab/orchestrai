"use client";

/**
 * @file apps/console/src/features/executions/components/execution-trace-waterfall.tsx
 * @description OpenTelemetry span waterfall timeline illustrating execution sub-tasks and latency.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { Activity, Clock, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { Panel } from "@yuva-devlab/ui";
import { TraceSpanStatus } from "@orchestrai/shared-types";
import { Skeleton } from "@/components/ui/skeleton";
import { UI_COPY } from "@/lib/ui-copy";
import { useExecutionTrace } from "../api/use-execution-trace";

export interface ExecutionTraceWaterfallProps {
  readonly executionId: string;
}

/**
 * OpenTelemetry span timeline waterfall for inspecting execution latency breakdown.
 */
export function ExecutionTraceWaterfall({
  executionId,
}: ExecutionTraceWaterfallProps): React.JSX.Element {
  const { data: trace, isLoading } = useExecutionTrace(executionId);
  const [expandedSpanId, setExpandedSpanId] = useState<string | null>(null);

  const spans = trace?.spans ?? [];

  if (isLoading) {
    return (
      <Panel title={UI_COPY.EXECUTIONS.WATERFALL.TITLE}>
        <div className="space-y-2 p-1">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </Panel>
    );
  }

  if (spans.length === 0) {
    return (
      <Panel title={UI_COPY.EXECUTIONS.WATERFALL.TITLE}>
        <div className="flex h-24 flex-col items-center justify-center text-center">
          <Activity className="text-muted-foreground mb-1.5 size-5" />
          <p className="text-muted-foreground text-xs">{UI_COPY.EXECUTIONS.WATERFALL.EMPTY_DESC}</p>
        </div>
      </Panel>
    );
  }

  // Calculate baseline timeline bounds
  const startTimes = spans.map((s) => new Date(s.startTime).getTime());
  const minTime = Math.min(...startTimes);
  const endTimes = spans.map((s) =>
    s.endTime ? new Date(s.endTime).getTime() : new Date(s.startTime).getTime() + s.durationMs,
  );
  const maxTime = Math.max(...endTimes, minTime + 1);
  const totalWindowMs = Math.max(1, maxTime - minTime);

  return (
    <Panel title={UI_COPY.EXECUTIONS.WATERFALL.TITLE}>
      <div className="mb-2 flex items-center justify-between border-b pb-2">
        <span className="text-muted-foreground text-xs font-medium">
          {UI_COPY.EXECUTIONS.WATERFALL.SPANS_LABEL}
        </span>
        <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px]">
          <Clock className="size-3" />
          <span>{UI_COPY.EXECUTIONS.WATERFALL.TOTAL_DURATION(totalWindowMs)}</span>
        </div>
      </div>
      <div className="space-y-2">
        {spans.map((span) => {
          const spanStart = new Date(span.startTime).getTime();
          const offsetPercent = Math.max(
            0,
            Math.min(95, ((spanStart - minTime) / totalWindowMs) * 100),
          );
          const durationPercent = Math.max(
            3,
            Math.min(100 - offsetPercent, (Math.max(1, span.durationMs) / totalWindowMs) * 100),
          );
          const isExpanded = expandedSpanId === span.spanId;
          const isError = span.status === TraceSpanStatus.ERROR || span.status === "error";

          return (
            <div
              key={span.spanId}
              className="border-border/60 bg-card/40 hover:bg-muted/20 rounded border p-2 text-xs transition-colors"
            >
              <div
                className="flex cursor-pointer items-center justify-between gap-2"
                onClick={() => setExpandedSpanId(isExpanded ? null : span.spanId)}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  {isExpanded ? (
                    <ChevronDown className="text-muted-foreground size-3 shrink-0" />
                  ) : (
                    <ChevronRight className="text-muted-foreground size-3 shrink-0" />
                  )}
                  {isError && <AlertCircle className="text-destructive size-3 shrink-0" />}
                  <span className="text-foreground truncate font-mono text-[11px] font-medium">
                    {span.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {span.durationMs}ms
                  </span>
                  <span
                    className={`py-0.2 rounded px-1.5 font-mono text-[9px] font-semibold uppercase ${
                      isError
                        ? "border-destructive/40 bg-destructive/10 text-destructive border"
                        : "border-primary/30 bg-primary/10 text-primary border"
                    }`}
                  >
                    {span.status}
                  </span>
                </div>
              </div>

              {/* Relative Waterfall Timing Bar */}
              <div className="bg-muted/40 relative mt-2 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={`absolute h-full rounded-full transition-all ${
                    isError ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{
                    left: `${offsetPercent}%`,
                    width: `${durationPercent}%`,
                  }}
                />
              </div>

              {/* Expanded OpenTelemetry Span Attributes */}
              {isExpanded && (
                <div className="border-border/40 bg-background/90 mt-2.5 rounded border p-2 font-mono text-[10px]">
                  <div className="text-muted-foreground mb-1 font-semibold">
                    {UI_COPY.EXECUTIONS.WATERFALL.SPAN_ID(span.spanId)}
                  </div>
                  {Object.keys(span.attributes).length > 0 ? (
                    <pre className="text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(span.attributes, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-muted-foreground italic">
                      {UI_COPY.EXECUTIONS.WATERFALL.NO_ATTRIBUTES}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
