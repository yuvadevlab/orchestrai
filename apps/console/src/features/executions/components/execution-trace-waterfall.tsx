"use client";

/**
 * @file apps/console/src/features/executions/components/execution-trace-waterfall.tsx
 * @description OpenTelemetry span waterfall timeline illustrating execution sub-tasks and latency.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { Activity, Clock, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { Panel } from "@orchestrai/ui";
import { TraceSpanStatus } from "@orchestrai/shared-types";
import { Skeleton } from "@orchestrai/ui/components/skeleton";
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
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.25rem" }}
        >
          <Skeleton
            style={{ height: "2.5rem", width: "100%", borderRadius: "var(--radius-sm, 0.25rem)" }}
          />
          <Skeleton
            style={{ height: "2.5rem", width: "100%", borderRadius: "var(--radius-sm, 0.25rem)" }}
          />
          <Skeleton
            style={{ height: "2.5rem", width: "100%", borderRadius: "var(--radius-sm, 0.25rem)" }}
          />
        </div>
      </Panel>
    );
  }

  if (spans.length === 0) {
    return (
      <Panel title={UI_COPY.EXECUTIONS.WATERFALL.TITLE}>
        <div
          className="orch-flex-col orch-items-center orch-justify-center orch-text-center"
          style={{ height: "6rem" }}
        >
          <Activity
            className="orch-text-muted"
            style={{ marginBottom: "0.375rem", width: "1.25rem", height: "1.25rem" }}
          />
          <p className="orch-text-muted" style={{ fontSize: "0.75rem" }}>
            {UI_COPY.EXECUTIONS.WATERFALL.EMPTY_DESC}
          </p>
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
      <div
        className="orch-flex-row orch-justify-between"
        style={{
          marginBottom: "0.5rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.5rem",
        }}
      >
        <span className="orch-text-muted orch-font-medium" style={{ fontSize: "0.75rem" }}>
          {UI_COPY.EXECUTIONS.WATERFALL.SPANS_LABEL}
        </span>
        <div
          className="orch-flex-row orch-gap-xs orch-text-muted orch-font-mono"
          style={{ fontSize: "0.6875rem" }}
        >
          <Clock style={{ width: "0.75rem", height: "0.75rem" }} />
          <span>{UI_COPY.EXECUTIONS.WATERFALL.TOTAL_DURATION(totalWindowMs)}</span>
        </div>
      </div>
      <div className="orch-flex-col orch-gap-sm">
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
            <div key={span.spanId} className="orch-waterfall-card">
              <div
                className="orch-flex-row orch-justify-between orch-gap-sm"
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedSpanId(isExpanded ? null : span.spanId)}
              >
                <div className="orch-flex-row orch-gap-xs" style={{ minWidth: 0 }}>
                  {isExpanded ? (
                    <ChevronDown
                      className="orch-text-muted"
                      style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0 }}
                    />
                  ) : (
                    <ChevronRight
                      className="orch-text-muted"
                      style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0 }}
                    />
                  )}
                  {isError && (
                    <AlertCircle
                      className="orch-text-destructive"
                      style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0 }}
                    />
                  )}
                  <span
                    className="orch-truncate orch-font-mono orch-font-medium"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {span.name}
                  </span>
                </div>

                <div className="orch-flex-row orch-gap-sm" style={{ flexShrink: 0 }}>
                  <span className="orch-text-muted orch-font-mono" style={{ fontSize: "0.625rem" }}>
                    {span.durationMs}ms
                  </span>
                  <span
                    className="orch-font-mono"
                    style={{
                      borderRadius: "var(--radius-sm, 0.25rem)",
                      padding: "0.125rem 0.375rem",
                      fontSize: "0.5625rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      border: isError
                        ? "1px solid color-mix(in oklab, var(--destructive) 40%, transparent)"
                        : "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
                      backgroundColor: isError
                        ? "color-mix(in oklab, var(--destructive) 10%, transparent)"
                        : "color-mix(in oklab, var(--primary) 10%, transparent)",
                      color: isError ? "var(--destructive)" : "var(--primary)",
                    }}
                  >
                    {span.status}
                  </span>
                </div>
              </div>

              {/* Relative Waterfall Timing Bar */}
              <div className="orch-waterfall-track">
                <div
                  className="orch-waterfall-span-bar"
                  style={{
                    backgroundColor: isError ? "var(--destructive)" : "var(--primary)",
                    left: `${offsetPercent}%`,
                    width: `${durationPercent}%`,
                  }}
                />
              </div>

              {/* Expanded OpenTelemetry Span Attributes */}
              {isExpanded && (
                <div className="orch-waterfall-details">
                  <div
                    className="orch-text-muted orch-font-semibold"
                    style={{ marginBottom: "0.25rem" }}
                  >
                    {UI_COPY.EXECUTIONS.WATERFALL.SPAN_ID(span.spanId)}
                  </div>
                  {Object.keys(span.attributes).length > 0 ? (
                    <pre
                      className="orch-text-muted"
                      style={{ overflowX: "auto", whiteSpace: "pre-wrap" }}
                    >
                      {JSON.stringify(span.attributes, null, 2)}
                    </pre>
                  ) : (
                    <span className="orch-text-muted" style={{ fontStyle: "italic" }}>
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
