import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { StatusChip } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { agents, executions, activityFeed } from "@/lib/mock-db";

/**
 * Grid section showing active agents and recent run traces.
 */
export function OverviewGrids(): React.JSX.Element {
  return (
    <>
      <section className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        {/* Agent Network */}
        <div className="border-border bg-card rounded-lg border p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-display text-sm font-semibold">Agent network</h2>
            <Link
              href="/agents"
              className="text-muted-foreground hover:text-primary ml-auto font-mono text-[10px]"
            >
              all agents →
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="border-border bg-background/60 hover:border-primary/40 flex items-center gap-2.5 rounded-md border p-2.5 transition-colors"
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-md border text-sm",
                    agent.status === "active"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {agent.glyph}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{agent.name}</span>
                  <span className="text-muted-foreground block truncate font-mono text-[10px]">
                    {agent.role}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Runs */}
        <div className="border-border bg-card rounded-lg border p-4 backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-display text-sm font-semibold">Recent runs</h2>
            <Link
              href="/executions"
              className="text-muted-foreground hover:text-primary ml-auto font-mono text-[10px]"
            >
              all runs →
            </Link>
          </div>
          <div className="space-y-2">
            {executions.slice(0, 4).map((execution) => (
              <Link
                key={execution.id}
                href={`/executions/${execution.id}`}
                className="border-border bg-background/60 hover:border-primary/40 block rounded-md border p-2.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {execution.id}
                  </span>
                  <span className="ml-auto">
                    <StatusChip status={execution.status} />
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px]">
                  {execution.task}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* System Pulse Activity */}
      <section className="border-border bg-card rounded-lg border p-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="text-primary size-3.5" />
          <h2 className="font-display text-sm font-semibold">System pulse</h2>
          <Link
            href="/activity"
            className="text-muted-foreground hover:text-primary ml-auto font-mono text-[10px]"
          >
            full activity →
          </Link>
        </div>
        <ul className="space-y-2">
          {activityFeed.slice(0, 5).map((item) => (
            <li key={item.id} className="flex gap-3 text-[11px]">
              <span className="bg-primary/60 mt-1 size-1.5 shrink-0 rounded-full" />
              <span className="min-w-0">
                <span className="text-foreground block font-medium">{item.title}</span>
                <span className="text-muted-foreground block truncate">{item.detail}</span>
              </span>
              <span className="text-muted-foreground ml-auto shrink-0 font-mono text-[10px]">
                {item.at}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
