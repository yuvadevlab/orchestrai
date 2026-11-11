"use client";

/**
 * @file agent-detail-page-content.tsx
 * @description Agent studio detail — system instructions, identity, attached tools, and execution history.
 * @module apps/console/features/agents/components
 */

import React from "react";
import Link from "next/link";
import { Panel, StatusChip } from "@orchestrai/ui";
import { useAgents } from "../api";
import { useExecutions } from "../../executions/api";
import { EmptyState, DetailPageSkeleton } from "@/components";
import { Bot } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { UI_COPY } from "@/lib/ui-copy";
import { AgentDetailSidebar } from "./agent-detail-sidebar";

export interface AgentDetailPageContentProps {
  agentId: string;
}

/** Agent detail page content. */
export function AgentDetailPageContent({
  agentId,
}: AgentDetailPageContentProps): React.JSX.Element {
  const { data: agents, isLoading: isLoadingAgents } = useAgents();
  const { data: executions } = useExecutions();

  const agent = agents.find((a) => a.id === agentId);
  const history = executions.filter((ex) => ex.primaryAgent === agentId || ex.id === agentId);

  return (
    <PageShell
      title={agent ? agent.name : `Agent / ${agentId}`}
      breadcrumb={UI_COPY.AGENTS.BREADCRUMB}
      stats={agent ? `${agent.status} · ${agent.model}` : undefined}
      description={agent?.description || UI_COPY.AGENTS.PAGE_DESCRIPTION}
    >
      {isLoadingAgents ? (
        <DetailPageSkeleton />
      ) : !agent ? (
        <EmptyState
          icon={Bot}
          title={UI_COPY.AGENTS.DETAIL.NOT_FOUND_TITLE}
          description={UI_COPY.AGENTS.DETAIL.NOT_FOUND_DESC(agentId)}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Panel title={UI_COPY.AGENTS.DETAIL.SYSTEM_INSTRUCTIONS_TITLE}>
              <p
                style={{
                  color: "var(--mutedForeground)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  margin: 0,
                }}
              >
                {agent.description}
              </p>
            </Panel>

            <Panel
              title={UI_COPY.AGENTS.DETAIL.EXECUTION_HISTORY_TITLE}
              meta={UI_COPY.AGENTS.DETAIL.RUNS_COUNT(history.length)}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {history.length === 0 ? (
                  <p
                    style={{
                      color: "var(--mutedForeground)",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.75rem",
                      margin: 0,
                    }}
                  >
                    {UI_COPY.AGENTS.DETAIL.NO_RUNS_DESC}
                  </p>
                ) : (
                  history.map((execution) => (
                    <Link
                      key={execution.id}
                      href={`/executions/${execution.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        borderRadius: "var(--radius-md, 0.375rem)",
                        border: "1px solid var(--border)",
                        padding: "0.5rem 0.75rem",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "border-color 150ms ease",
                      }}
                    >
                      <span
                        style={{
                          minWidth: 0,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "0.75rem",
                        }}
                      >
                        {execution.intent}
                      </span>
                      <span
                        style={{
                          color: "var(--mutedForeground)",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.625rem",
                        }}
                      >
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
          <AgentDetailSidebar agent={agent} />
        </div>
      )}
    </PageShell>
  );
}
