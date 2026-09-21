"use client";

/**
 * @file agent-detail-page-content.tsx
 * @description Detailed agent studio view showing instructions, parameters, tools, and execution history.
 * @module apps/console/features/agents/components
 */

import React from "react";
import Link from "next/link";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { useAgents } from "../api";
import { useExecutions } from "../../executions/api";
import { EmptyState } from "@/components";
import { Bot } from "lucide-react";

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

export interface AgentDetailPageContentProps {
  agentId: string;
}

export function AgentDetailPageContent({
  agentId,
}: AgentDetailPageContentProps): React.JSX.Element {
  const { data: agents, isLoading: isLoadingAgents } = useAgents();
  const { data: executions } = useExecutions();

  const agent = agents.find((a) => a.id === agentId);
  const history = executions.filter((ex) => ex.primaryAgent === agentId || ex.id === agentId);

  if (isLoadingAgents) {
    return (
      <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
        <span className="text-muted-foreground animate-pulse font-mono text-xs">
          Loading agent specification...
        </span>
      </div>
    );
  }

  if (!agent) {
    return (
      <EmptyState
        icon={Bot}
        title="Agent Entity Not Found"
        description={`No agent with identifier "${agentId}" was found in the cluster registry.`}
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {/* Main Column */}
      <div className="space-y-3 lg:col-span-2">
        <Panel title="System Instructions">
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {agent.description}
          </p>
        </Panel>

        <Panel title="Execution history" meta={`${history.length} recorded runs`}>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-muted-foreground font-mono text-xs">
                No recorded runs for this agent yet.
              </p>
            ) : (
              history.map((execution) => (
                <Link
                  key={execution.id}
                  href={`/executions/${execution.id}`}
                  className="border-border hover:border-primary/40 flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
                >
                  <span className="min-w-0 flex-1 truncate text-xs">{execution.intent}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {execution.latencyMs}ms
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
              ◉
            </span>
            <div>
              <p className="text-sm font-semibold">{agent.role}</p>
              <p className="text-muted-foreground font-mono text-[10px]">{agent.id}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-xs">
            <Row label="Model" value={agent.model} mono />
            <Row label="Status" value={agent.status} />
            <Row label="Executions" value={String(agent.totalExecutions)} />
            <Row label="Success rate" value={`${agent.successRate}%`} />
          </dl>
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
  );
}
