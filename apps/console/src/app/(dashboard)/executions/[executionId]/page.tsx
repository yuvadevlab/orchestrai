import React from "react";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { executions } from "@/lib/mock-db";

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

/**
 * Replayable execution session detail with DAG step trace and recovery metadata.
 */
export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}): Promise<React.JSX.Element> {
  const { executionId } = await params;
  const execution = executions.find((item) => item.id === executionId);

  if (!execution) {
    notFound();
  }

  return (
    <PageShell
      title={execution.task}
      breadcrumb="Executions"
      description={execution.summary}
      actions={<StatusChip status={execution.status} />}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-3 lg:col-span-2">
          <Panel title="Step trace" meta={`${execution.steps.length} steps executed`}>
            <ol className="space-y-2">
              {execution.steps.map((step, index) => (
                <li key={step.id} className="border-border rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-semibold">{step.label}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {step.agent}
                    </span>
                    <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                      {step.duration}
                    </span>
                    <StatusChip status={step.status} />
                  </div>
                  <div className="text-muted-foreground mt-2 grid gap-1 font-mono text-[10px]">
                    <p className="truncate">in → {step.input}</p>
                    <p className="text-foreground truncate">out ← {step.output}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          {execution.errors.length > 0 ? (
            <Panel title="Failures & recovery" meta={`${execution.errors.length} alert`}>
              <div className="space-y-2">
                {execution.errors.map((error) => (
                  <div
                    key={error.step}
                    className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-xs"
                  >
                    <p className="text-destructive font-mono text-[10px] font-semibold">
                      {error.step}
                    </p>
                    <p className="text-muted-foreground mt-1">{error.message}</p>
                    <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                      Recovery status:{" "}
                      {error.recovered ? "recovered automatically" : "unrecovered / aborted"}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>

        {/* Sidebar Column */}
        <Panel title="Run metadata">
          <dl className="space-y-2 text-xs">
            <Row label="Execution ID" value={execution.id} mono />
            <Row label="Primary Agent" value={execution.agent} />
            <Row label="Operating Mode" value={execution.mode} />
            <Row label="Started at" value={execution.startedAt} mono />
            <Row label="Completed at" value={execution.completedAt ?? "In Progress"} mono />
            <Row label="Total Duration" value={execution.duration} mono />
            <Row label="Tool calls" value={String(execution.tools)} mono />
            <Row label="Tokens billed" value={execution.tokens.toLocaleString()} mono />
          </dl>
        </Panel>
      </div>
    </PageShell>
  );
}
