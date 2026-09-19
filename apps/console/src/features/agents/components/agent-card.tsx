import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from "@yuva-devlab/ui";
import { Bot, Cpu, Wrench, Activity } from "lucide-react";
import type { AgentDefinition } from "../types";

export interface AgentCardProps {
  agent: AgentDefinition;
}

/**
 * Visual card representing a registered agent in the cluster.
 *
 * @param props.agent - Agent data entity.
 */
export function AgentCard({ agent }: AgentCardProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card hover:border-border/80 flex flex-col shadow-sm transition-colors">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Bot className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">{agent.name}</CardTitle>
              <CardDescription className="text-muted-foreground font-mono text-xs">
                {agent.role}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={agent.status === "ACTIVE" ? "default" : "outline"}
            className="px-1.5 py-0.5 font-mono text-[10px]"
          >
            {agent.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 p-4">
        <p className="text-muted-foreground text-xs leading-relaxed">{agent.description}</p>

        {/* Model Tag */}
        <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
          <Cpu className="text-primary size-3.5" />
          <span>Model: </span>
          <span className="text-foreground font-semibold">{agent.model}</span>
        </div>

        {/* Bound Tools */}
        <div className="space-y-1.5">
          <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
            <Wrench className="size-3" />
            <span>Bound Tools:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {agent.tools.map((t) => (
              <Badge key={t} variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-border/50 text-muted-foreground flex items-center justify-between border-t px-4 pt-2 pb-3 font-mono text-xs">
        <div>
          <span>Runs: </span>
          <span className="text-foreground font-semibold">{agent.totalExecutions}</span>
        </div>
        <div className="text-primary flex items-center gap-1">
          <Activity className="size-3" />
          <span>{agent.successRate}% pass</span>
        </div>
      </CardFooter>
    </Card>
  );
}
