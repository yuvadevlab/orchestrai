import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { workflows } from "@/lib/mock-db";

const nodeTone: Record<string, string> = {
  start: "border-border bg-secondary text-muted-foreground",
  agent: "border-primary/35 bg-primary/10 text-primary font-medium",
  tool: "border-border bg-card text-foreground shadow-sm",
  condition: "border-border bg-card text-foreground shadow-sm",
  approval: "border-warning/35 bg-warning/10 text-warning font-medium",
  parallel: "border-primary/25 bg-primary/5 text-primary",
  end: "border-border bg-secondary text-muted-foreground",
};

/**
 * Reusable multi-lane visual orchestration graphs.
 * Renders horizontal DAG tracks across parallel execution lanes over the topology grid.
 */
export default function WorkflowsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Workflows"
      breadcrumb="Workflows"
      description="Pre-composed orchestration paths that can be launched and watched in the console."
    >
      <div className="space-y-4">
        {workflows.map((workflow) => {
          const lanes = [...new Set(workflow.nodes.map((node) => node.lane))].sort((a, b) => a - b);

          return (
            <Panel key={workflow.id} className="hover:border-primary/30 transition-colors">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <p className="font-display text-sm font-semibold">{workflow.name}</p>
                  <p className="text-muted-foreground text-xs">{workflow.description}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {workflow.runs} runs · {workflow.successRate}% ok
                  </span>
                  <StatusChip status={workflow.status} />
                </div>
              </div>

              {/* Topology DAG Canvas */}
              <div className="border-border bg-background/80 topology-grid mt-4 overflow-x-auto rounded-md border p-5">
                <div className="flex min-w-max items-center gap-3">
                  {lanes.map((lane, laneIndex) => (
                    <div key={lane} className="flex items-center gap-3">
                      {/* Vertical Node Stack for this lane */}
                      <div className="flex flex-col gap-2.5">
                        {workflow.nodes
                          .filter((node) => node.lane === lane)
                          .map((node) => (
                            <div
                              key={node.id}
                              className={cn(
                                "hover:scale-1.02 rounded-md border px-3 py-1.5 text-[11px] whitespace-nowrap transition-transform",
                                nodeTone[node.type] ?? "border-border bg-card",
                              )}
                            >
                              <span>{node.label}</span>
                              <span className="ml-2 font-mono text-[9px] opacity-70">
                                {node.type}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Lane Connector Line */}
                      {laneIndex < lanes.length - 1 ? (
                        <span className="bg-border h-px w-6" aria-hidden />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </PageShell>
  );
}
