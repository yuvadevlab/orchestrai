"use client";

/**
 * @file evaluations-page-content.tsx
 * @description Agent evaluation suite benchmark results view with EmptyState support.
 * @module apps/console/features/evaluations
 */

import React from "react";
import { Panel, Progress } from "@yuva-devlab/ui";
import { BarChart3 } from "lucide-react";
import { useEvaluations } from "@/features/evaluations/api";
import { EmptyState } from "@/components/ui/empty-state";

function Bar({ label, value }: { label: string; value: number }): React.JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-[10px] font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="mt-1 h-1" />
    </div>
  );
}

export function EvaluationsPageContent(): React.JSX.Element {
  const { data: evaluations, isLoading } = useEvaluations();

  if (isLoading) {
    return (
      <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
        <span className="text-muted-foreground animate-pulse font-mono text-xs">
          Loading evaluation suite results...
        </span>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Evaluation Benchmark Runs"
        description="Run automated evaluation benchmark suites over test cases to measure tool selection precision and agent task completion."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {evaluations.map((evaluation) => (
        <Panel key={evaluation.id}>
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{evaluation.name}</p>
              <p className="text-muted-foreground font-mono text-[10px]">
                {evaluation.agent} · {evaluation.cases} cases
              </p>
            </div>
            <span className="text-primary font-display ml-auto text-2xl font-bold tabular-nums">
              {evaluation.score}
            </span>
          </div>

          <div className="border-border mt-4 space-y-2.5 border-t pt-3">
            <Bar label="Tool selection accuracy" value={evaluation.toolSelection} />
            <Bar label="RAG retrieval accuracy" value={evaluation.ragRetrieval} />
            <Bar label="Task completion rate" value={evaluation.taskCompletion} />
          </div>

          <p className="text-muted-foreground mt-4 font-mono text-[10px]">
            {evaluation.latency} avg · ran {evaluation.ranAt}
          </p>
        </Panel>
      ))}
    </div>
  );
}
