"use client";

/**
 * @file agent-detail-sidebar.tsx
 * @description Sidebar panels for agent specification and attached tools.
 * @module apps/console/features/agents/components
 */

import React from "react";
import { Panel } from "@orchestrai/ui";
import type { AgentDefinition } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

/** A label–value definition list row for agent detail panels. */
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
        paddingBottom: "0.375rem",
      }}
    >
      <dt style={{ color: "var(--mutedForeground)" }}>{label}</dt>
      <dd
        style={{
          fontFamily: mono ? "var(--font-mono, monospace)" : undefined,
          fontSize: mono ? "0.6875rem" : undefined,
          margin: 0,
        }}
      >
        {value}
      </dd>
    </div>
  );
}

export interface AgentDetailSidebarProps {
  readonly agent: AgentDefinition;
}

/**
 * Specification and tools panels for the agent detail page.
 */
export function AgentDetailSidebar({ agent }: AgentDetailSidebarProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Panel title={UI_COPY.AGENTS.DETAIL.SPECIFICATION_TITLE}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--secondary)",
              color: "var(--primary)",
              fontFamily: "var(--font-display, sans-serif)",
              display: "grid",
              height: "3rem",
              width: "3rem",
              placeItems: "center",
              borderRadius: "var(--radius-md, 0.375rem)",
              fontSize: "1.25rem",
            }}
          >
            ◉
          </span>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>{agent.role}</p>
            <p
              style={{
                color: "var(--mutedForeground)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.625rem",
                margin: 0,
              }}
            >
              {agent.id}
            </p>
          </div>
        </div>
        <dl
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.75rem",
          }}
        >
          <Row label={UI_COPY.AGENTS.DETAIL.MODEL_LABEL} value={agent.model} mono />
          <Row label={UI_COPY.AGENTS.DETAIL.STATUS_LABEL} value={agent.status} />
          <Row
            label={UI_COPY.AGENTS.DETAIL.EXECUTIONS_LABEL}
            value={String(agent.totalExecutions)}
          />
          <Row
            label={UI_COPY.AGENTS.DETAIL.SUCCESS_RATE_LABEL}
            value={UI_COPY.AGENTS.DETAIL.PERCENTAGE(agent.successRate)}
          />
        </dl>
      </Panel>

      <Panel title={UI_COPY.AGENTS.DETAIL.TOOLS_TITLE}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {agent.tools.length === 0 ? (
            <p
              style={{
                color: "var(--mutedForeground)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                margin: 0,
              }}
            >
              {UI_COPY.AGENTS.DETAIL.NO_TOOLS_DESC}
            </p>
          ) : (
            agent.tools.map((tool) => (
              <span
                key={tool}
                style={{
                  border: "1px solid color-mix(in oklab, var(--primary) 25%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--primary) 5%, transparent)",
                  color: "var(--primary)",
                  borderRadius: "var(--radius-sm, 0.25rem)",
                  paddingInline: "0.5rem",
                  paddingBlock: "0.125rem",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.625rem",
                }}
              >
                {tool}
              </span>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
