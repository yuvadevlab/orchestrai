import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatusChip } from "@yuva-devlab/ui";
import { agents } from "@/lib/mock-db";

/**
 * Agent directory displaying every entity available to the orchestrator.
 * Styled to match the OrchestrAI Lovable reference — raw span elements for
 * capability tags, Link directly wrapping the card content.
 */
export default function AgentsPage(): React.JSX.Element {
  const activeCount = agents.filter((agent) => agent.status === "active").length;

  return (
    <PageShell
      title="Agent roster"
      breadcrumb="Agents"
      description="Every entity available to the orchestrator, with its operating mode, capabilities and recent reliability."
      actions={
        <span className="text-muted-foreground font-mono text-[10px]">
          {activeCount}/{agents.length} active
        </span>
      }
    >
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="group border-border bg-card hover:border-primary/40 rounded-lg border p-4 transition-colors"
          >
            {/* Agent header: glyph, name, role, status */}
            <div className="flex items-start gap-3">
              <span className="border-border bg-secondary font-display text-primary grid size-10 shrink-0 place-items-center rounded-md border text-base">
                {agent.glyph}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold">{agent.name}</p>
                <p className="text-muted-foreground text-xs">{agent.role}</p>
              </div>
              <span className="ml-auto">
                <StatusChip status={agent.status} />
              </span>
            </div>

            {/* Short description */}
            <p className="text-muted-foreground mt-3 line-clamp-2 text-xs">{agent.description}</p>

            {/* Capability tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.capabilities.slice(0, 3).map((capability) => (
                <span
                  key={capability}
                  className="border-border text-muted-foreground rounded border px-1.5 py-0.5 text-[10px]"
                >
                  {capability}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="border-border text-muted-foreground mt-3 grid grid-cols-3 gap-2 border-t pt-3 font-mono text-[10px]">
              <span>{agent.stats.executions} runs</span>
              <span>{agent.stats.successRate}% ok</span>
              <span>{agent.stats.avgDuration} avg</span>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
