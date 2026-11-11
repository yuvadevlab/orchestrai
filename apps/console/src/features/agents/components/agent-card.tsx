import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@orchestrai/ui";
import { StatusBadge } from "@orchestrai/ui/components/status-badge";
import { ALPHANUMERIC_START_REGEX } from "@orchestrai/regex";
import type { AgentDefinition } from "../types";

export interface AgentCardProps {
  agent: AgentDefinition;
}

/**
 * Computes uppercase initials from an agent's name.
 * Filters out symbols and punctuation (e.g. "Data & Insights Analyst" -> "DI").
 *
 * @param name - Display name of the agent.
 * @returns 2-letter uppercase initials.
 */
function getInitials(name: string): string {
  // Split on whitespace and filter out standalone symbols (e.g. "&", "-", "/")
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => ALPHANUMERIC_START_REGEX.test(word));

  // If two or more meaningful words exist, take the first letter of each of the first two words
  if (words.length >= 2 && words[0] && words[1]) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  // Single-word agent name: take first two characters
  if (words.length === 1 && words[0]) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Visual card representing a registered agent in the cluster.
 * Follows the orchestrai-src specialist card layout.
 *
 * @param props.agent - Agent data entity.
 */
export function AgentCard({ agent }: AgentCardProps): React.JSX.Element {
  const initials = getInitials(agent.name);

  return (
    <Card className="orch-agent-card">
      <CardHeader
        style={{
          borderBottom: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          paddingBottom: "0.875rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="orch-agent-icon">{initials}</div>
            <div>
              <CardTitle
                style={{
                  color: "var(--foreground)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {agent.name}
              </CardTitle>
              <div
                style={{
                  color: "var(--mutedForeground)",
                  marginTop: "0.125rem",
                  fontSize: "0.75rem",
                }}
              >
                {agent.role} · {agent.model}
              </div>
            </div>
          </div>

          <StatusBadge status={agent.status} />
        </div>
      </CardHeader>

      <CardContent
        style={{
          flex: 1,
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
        }}
      >
        <p className="orch-agent-desc">{agent.description}</p>

        {/* Bound Tools / Capabilities */}
        {agent.tools.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", paddingTop: "0.25rem" }}
          >
            {agent.tools.map((t) => (
              <span
                key={t}
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "var(--secondaryForeground)",
                  borderRadius: "var(--radius-md, 0.375rem)",
                  paddingInline: "0.5rem",
                  paddingBlock: "0.125rem",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter
        style={{
          borderTop: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          color: "var(--mutedForeground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: "1rem",
          paddingTop: "0.75rem",
          paddingBottom: "0.875rem",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
        }}
      >
        <span>{agent.totalExecutions} runs</span>
        <span style={{ color: "var(--success, #22c55e)", fontWeight: 600 }}>
          {agent.successRate}% success
        </span>
      </CardFooter>
    </Card>
  );
}
