"use client";

/**
 * @file overview-grids.tsx
 * @description Overview grid section displaying live agent network, execution traces, and system pulse with EmptyState guards.
 * @module apps/console/features/overview
 */

import React from "react";
import Link from "next/link";
import { Activity, Bot, Play } from "lucide-react";
import { StatusChip } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { useAgents } from "@/features/agents/api";
import { useExecutions } from "@/features/executions/api";

/**
 * Grid section showing active agents and recent run traces.
 */
export function OverviewGrids(): React.JSX.Element {
  const { data: agents } = useAgents();
  const { data: executions } = useExecutions();

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
          {agents.length === 0 ? (
            <div className="border-border/60 bg-background/40 flex flex-col items-center justify-center rounded-md border p-6 text-center">
              <Bot className="text-muted-foreground mb-1.5 size-5" />
              <p className="text-muted-foreground font-mono text-xs">No agents registered</p>
            </div>
          ) : (
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
                      agent.status === "ACTIVE"
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground",
                    )}
                  >
                    ◉
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
          )}
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
          {executions.length === 0 ? (
            <div className="border-border/60 bg-background/40 flex flex-col items-center justify-center rounded-md border p-6 text-center">
              <Play className="text-muted-foreground mb-1.5 size-5" />
              <p className="text-muted-foreground font-mono text-xs">No recent execution runs</p>
            </div>
          ) : (
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
                    {execution.intent}
                  </p>
                </Link>
              ))}
            </div>
          )}
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
        <div className="border-border/60 bg-background/40 flex items-center justify-center rounded-md border p-4">
          <span className="text-muted-foreground font-mono text-xs">
            Cluster operational — monitoring live outbox stream
          </span>
        </div>
      </section>
    </>
  );
}
