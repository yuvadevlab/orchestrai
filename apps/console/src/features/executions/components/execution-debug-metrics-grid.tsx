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
    <div className="flex flex-wrap items-stretch gap-3">
      <div className="border-border bg-muted/20 flex min-w-50 flex-1 flex-col justify-between rounded-lg border p-3.5">
        <span className="text-muted-foreground text-xs font-medium">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.SPECIALIST_LABEL}
        </span>
        <div className="text-foreground mt-1 text-sm font-semibold">{execution.agentName}</div>
        <span className="text-muted-foreground mt-0.5 text-xs">{execution.agentRole}</span>
      </div>

      <div className="border-border bg-muted/20 flex min-w-50 flex-1 flex-col justify-between rounded-lg border p-3.5">
        <span className="text-muted-foreground text-xs font-medium">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.MODEL_ENGINE_LABEL}
        </span>
        <div className="text-foreground mt-1 font-mono text-xs font-semibold break-all">
          {execution.agentModel}
        </div>
        <span className="text-muted-foreground mt-0.5 text-xs capitalize">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.MODE_LABEL(execution.mode)}
        </span>
      </div>

      <div className="border-border bg-muted/20 flex min-w-45 flex-1 flex-col justify-between rounded-lg border p-3.5">
        <span className="text-muted-foreground text-xs font-medium">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.DURATION_LATENCY_LABEL}
        </span>
        <div className="text-foreground mt-1 font-mono text-sm font-semibold">
          {execution.durationFormatted}
        </div>
        <span className="text-muted-foreground mt-0.5 font-mono text-xs">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.MS_TOTAL(execution.latencyMs)}
        </span>
      </div>

      <div className="border-border bg-muted/20 flex min-w-45 flex-1 flex-col justify-between rounded-lg border p-3.5">
        <span className="text-muted-foreground text-xs font-medium">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.PROGRESS_TOKENS_LABEL}
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-foreground text-sm font-semibold">
            {UI_COPY.EXECUTIONS.DEBUG_DIALOG.STEP_PROGRESS(
              execution.stepsCompleted,
              execution.totalSteps,
            )}
          </span>
        </div>
        <span className="text-muted-foreground mt-0.5 font-mono text-xs">
          {UI_COPY.EXECUTIONS.DEBUG_DIALOG.TOKENS_FORMAT(execution.tokensUsed)}
        </span>
      </div>
    </div>
  );
}
