"use client";

/**
 * @file execution-detail-page-content.tsx
 * @description Execution session detail — DAG step trace, token usage, and run metadata.
 * @module apps/console/features/executions/components
 */

import React from "react";
import { Panel } from "@yuva-devlab/ui";
import { useExecutions } from "../api";
import { EmptyState } from "@/components/ui/empty-state";
import { DetailPageSkeleton } from "@/components/ui/skeleton";
import { Play } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { UI_COPY } from "@/lib/ui-copy";

import { ExecutionTraceWaterfall } from "./execution-trace-waterfall";
import { DagVisualizer } from "./dag-visualizer";
import { CheckpointReplayer } from "./checkpoint-replayer";

/** A label–value definition list row used in the execution metadata panel. */
function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): React.JSX.Element {
  return (
    <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-[11px]" : ""}>{value}</dd>
    </div>
  );
}

export interface ExecutionDetailPageContentProps {
  executionId: string;
}

/** Execution detail page content. */
export function ExecutionDetailPageContent({
  executionId,
}: ExecutionDetailPageContentProps): React.JSX.Element {
  const { data: executions, isLoading } = useExecutions();
  const execution = executions.find((item) => item.id === executionId);

  return (
    <PageShell
      title={UI_COPY.EXECUTIONS.DETAIL.TITLE_WITH_ID(executionId)}
      breadcrumb={UI_COPY.EXECUTIONS.DETAIL.BREADCRUMB}
      stats={
        execution
          ? UI_COPY.EXECUTIONS.DETAIL.STATS_FORMAT(execution.status, execution.latencyMs)
          : undefined
      }
      description={UI_COPY.EXECUTIONS.PAGE_DESCRIPTION}
    >
      {isLoading ? (
        <DetailPageSkeleton />
      ) : !execution ? (
        <EmptyState
          icon={Play}
          title={UI_COPY.EXECUTIONS.DETAIL.NOT_FOUND_TITLE}
          description={UI_COPY.EXECUTIONS.DETAIL.NOT_FOUND_DESC(executionId)}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-3 lg:col-span-2">
            <Panel title={UI_COPY.EXECUTIONS.DETAIL.INTENT_TITLE}>
              <p className="text-sm font-semibold">{execution.intent}</p>
            </Panel>

            <Panel title={UI_COPY.EXECUTIONS.DETAIL.TRACE_SUMMARY_TITLE}>
              <div className="space-y-2 font-mono text-xs">
                <Row
                  label={UI_COPY.EXECUTIONS.DETAIL.STEPS_LABEL}
                  value={UI_COPY.EXECUTIONS.DETAIL.STEPS_VALUE(
                    execution.stepsCompleted,
                    execution.totalSteps,
                  )}
                  mono
                />
                <Row
                  label={UI_COPY.EXECUTIONS.DETAIL.LATENCY_LABEL}
                  value={UI_COPY.EXECUTIONS.DETAIL.LATENCY_VALUE(execution.latencyMs)}
                  mono
                />
                <Row
                  label={UI_COPY.EXECUTIONS.DETAIL.TOKENS_LABEL}
                  value={execution.tokensUsed.toLocaleString()}
                  mono
                />
              </div>
            </Panel>

            {/* Interactive DAG Visualizer */}
            <DagVisualizer execution={execution} />

            {/* Forensic Checkpoint Timeline Scrubber */}
            <CheckpointReplayer execution={execution} />

            <ExecutionTraceWaterfall executionId={executionId} />
          </div>

          {/* Sidebar Column */}
          <Panel title={UI_COPY.EXECUTIONS.DETAIL.METADATA_TITLE}>
            <dl className="space-y-2 text-xs">
              <Row label={UI_COPY.EXECUTIONS.DETAIL.ID_LABEL} value={execution.id} mono />
              <Row label={UI_COPY.EXECUTIONS.DETAIL.AGENT_LABEL} value={execution.primaryAgent} />
              <Row label={UI_COPY.EXECUTIONS.DETAIL.STATUS_LABEL} value={execution.status} />
              <Row
                label={UI_COPY.EXECUTIONS.DETAIL.DISPATCHED_LABEL}
                value={execution.createdAt}
                mono
              />
            </dl>
          </Panel>
        </div>
      )}
    </PageShell>
  );
}
