import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, Progress } from "@yuva-devlab/ui";
import { evaluations } from "@/lib/mock-db";

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

/**
 * Scored evaluation suites measuring tool selection, retrieval and task completion accuracy.
 */
export default function EvaluationsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Evaluations"
      breadcrumb="Evaluations"
      description="How well the system performs when it is graded rather than watched."
    >
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
    </PageShell>
  );
}
