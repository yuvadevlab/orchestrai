import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@yuva-devlab/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AgentDefinition } from "../types";

export interface AgentCardProps {
  agent: AgentDefinition;
}

/**
 * Computes uppercase initials from an agent's name.
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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
    <Card className="border-border bg-card hover:border-border/80 flex flex-col rounded-md shadow-xs transition-colors">
      <CardHeader className="border-border/50 border-b pb-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-md font-mono text-sm font-bold">
              {initials}
            </div>
            <div>
              <CardTitle className="text-foreground text-sm font-semibold tracking-tight">
                {agent.name}
              </CardTitle>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {agent.role} · {agent.model}
              </div>
            </div>
          </div>

          <StatusBadge status={agent.status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3.5 p-4">
        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
          {agent.description}
        </p>

        {/* Bound Tools / Capabilities */}
        {agent.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {agent.tools.map((t) => (
              <span
                key={t}
                className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-mono text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-border/50 text-muted-foreground flex items-center justify-between border-t px-4 pt-3 pb-3.5 font-mono text-xs">
        <span>{agent.totalExecutions} runs</span>
        <span className="text-success font-semibold">{agent.successRate}% success</span>
      </CardFooter>
    </Card>
  );
}
