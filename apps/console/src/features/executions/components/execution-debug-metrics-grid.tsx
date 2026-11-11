/**
 * @file execution-debug-metrics-grid.tsx
 * @description Quick telemetry metrics grid row for the execution developer debug dialog.
 * Displays specialist info, model engine, duration/latency, and step/token progress.
 * @module apps/console/features/executions/components
 */

import React from "react";
import type { ExecutionRun } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

export interface ExecutionDebugMetricsGridProps {
  /** The execution record to display metrics for */
  execution: ExecutionRun;
}

/**
 * Renders the 4-tile telemetry metrics grid in the execution debug dialog.
 */
export function ExecutionDebugMetricsGrid({
  execution,
}: ExecutionDebugMetricsGridProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "0.75rem" }}>
      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
          display: "flex",
          minWidth: "12rem",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "var(--radius-lg, 0.5rem)",
          padding: "0.875rem",
        }}
      >
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", fontWeight: 500 }}>
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.SPECIALIST_LABEL}
        </span>
        <div
          style={{
            color: "var(--foreground)",
            marginTop: "0.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {execution.agentName}
        </div>
        <span
          style={{ color: "var(--mutedForeground)", marginTop: "0.125rem", fontSize: "0.75rem" }}
        >
          {execution.agentRole}
        </span>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
          display: "flex",
          minWidth: "12rem",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "var(--radius-lg, 0.5rem)",
          padding: "0.875rem",
        }}
      >
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", fontWeight: 500 }}>
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.MODEL_ENGINE_LABEL}
        </span>
        <div
          style={{
            color: "var(--foreground)",
            marginTop: "0.25rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            fontWeight: 600,
            wordBreak: "break-all",
          }}
        >
          {execution.agentModel}
        </div>
        <span
          style={{
            color: "var(--mutedForeground)",
            marginTop: "0.125rem",
            fontSize: "0.75rem",
            textTransform: "capitalize",
          }}
        >
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.MODE_LABEL(execution.mode)}
        </span>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
          display: "flex",
          minWidth: "11rem",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "var(--radius-lg, 0.5rem)",
          padding: "0.875rem",
        }}
      >
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", fontWeight: 500 }}>
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.DURATION_LATENCY_LABEL}
        </span>
        <div
          style={{
            color: "var(--foreground)",
            marginTop: "0.25rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {execution.durationFormatted}
        </div>
        <span
          style={{
            color: "var(--mutedForeground)",
            marginTop: "0.125rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
          }}
        >
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.MS_TOTAL(execution.latencyMs)}
        </span>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
          display: "flex",
          minWidth: "11rem",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "var(--radius-lg, 0.5rem)",
          padding: "0.875rem",
        }}
      >
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", fontWeight: 500 }}>
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.PROGRESS_TOKENS_LABEL}
        </span>
        <div style={{ marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--foreground)", fontSize: "0.875rem", fontWeight: 600 }}>
            {UI_COPY.EXECUTIONS.DEBUG_DIALOG.STEP_PROGRESS(
              execution.stepsCompleted,
              execution.totalSteps,
            )}
          </span>
        </div>
        <span
          style={{
            color: "var(--mutedForeground)",
            marginTop: "0.125rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
          }}
        >
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.TOKENS_FORMAT(execution.tokensUsed)}
        </span>
      </div>
    </div>
  );
}
