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
import { Play } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

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
      title={`Execution / ${executionId}`}
      breadcrumb="Executions"
      stats={execution ? `${execution.status} · ${execution.latencyMs}ms` : undefined}
      description="Replayable execution session record with step checkpoints and recovery metadata."
    >
      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading execution trace...
          </span>
        </div>
      ) : !execution ? (
        <EmptyState
          icon={Play}
          title="Execution Trace Not Found"
          description={`No recorded execution run matching ID "${executionId}" was found in cluster memory.`}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-3 lg:col-span-2">
            <Panel title="Execution Intent">
              <p className="text-sm font-semibold">{execution.intent}</p>
            </Panel>

            <Panel title="Step Trace Summary">
              <div className="space-y-2 font-mono text-xs">
                <Row
                  label="Steps Completed"
                  value={`${execution.stepsCompleted}/${execution.totalSteps}`}
                  mono
                />
                <Row label="Latency" value={`${execution.latencyMs}ms`} mono />
                <Row label="Tokens Billed" value={execution.tokensUsed.toLocaleString()} mono />
              </div>
            </Panel>
          </div>

          {/* Sidebar Column */}
          <Panel title="Run Metadata">
            <dl className="space-y-2 text-xs">
              <Row label="Execution ID" value={execution.id} mono />
              <Row label="Primary Agent" value={execution.primaryAgent} />
              <Row label="Status" value={execution.status} />
              <Row label="Dispatched at" value={execution.createdAt} mono />
            </dl>
          </Panel>
        </div>
      )}
    </PageShell>
  );
}
