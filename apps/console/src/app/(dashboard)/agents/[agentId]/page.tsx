import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { agents, executions } from "@/lib/mock-db";

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
 * Detailed agent studio view showing instructions, identity, parameters, tools and execution history.
 */
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<React.JSX.Element> {
  const { agentId } = await params;
  const agent = agents.find((item) => item.id === agentId);

  if (!agent) {
    notFound();
  }

  const history = executions.filter((exec) => exec.agentId === agentId);

  return (
    <PageShell
      title={agent.name}
      breadcrumb="Agents"
      description={agent.description}
      actions={<StatusChip status={agent.status} />}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-3 lg:col-span-2">
          <Panel title="Instructions" meta={agent.mode}>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {agent.instructions}
            </p>
          </Panel>

          <Panel title="Execution history" meta={`${history.length} recorded runs`}>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No recorded runs for this agent yet.
                </p>
              ) : (
                history.map((execution) => (
                  <Link
                    key={execution.id}
                    href={`/executions/${execution.id}`}
                    className="border-border hover:border-primary/40 flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs">{execution.task}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {execution.duration}
                    </span>
                    <StatusChip status={execution.status} />
                  </Link>
                ))
              )}
            </div>
          </Panel>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-3">
          <Panel title="Identity">
            <div className="flex items-center gap-3">
              <span className="border-border bg-secondary text-primary font-display grid size-12 place-items-center rounded-md border text-xl">
                {agent.glyph}
              </span>
              <div>
                <p className="text-sm font-semibold">{agent.role}</p>
                <p className="text-muted-foreground font-mono text-[10px]">{agent.id}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-xs">
              <Row label="Model" value={agent.model} mono />
              <Row label="Mode" value={agent.mode} />
              <Row label="Executions" value={String(agent.stats.executions)} />
              <Row label="Success rate" value={`${agent.stats.successRate}%`} />
              <Row label="Avg duration" value={agent.stats.avgDuration} mono />
              <Row label="Tokens consumed" value={agent.stats.tokens} mono />
            </dl>
          </Panel>

          <Panel title="Capabilities">
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.map((capability) => (
                <span
                  key={capability}
                  className="border-border text-muted-foreground rounded border px-2 py-0.5 text-[10px]"
                >
                  {capability}
                </span>
              ))}
            </div>
          </Panel>

          <Panel title="Attached Tools">
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="border-primary/25 bg-primary/5 text-primary rounded border px-2 py-0.5 font-mono text-[10px]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
