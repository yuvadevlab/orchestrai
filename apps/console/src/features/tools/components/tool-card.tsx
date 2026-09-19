import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@yuva-devlab/ui";
import { Wrench } from "lucide-react";
import type { ToolDefinition } from "../types";

/**
 * Props for ToolCard component.
 */
export interface ToolCardProps {
  /** Tool definition model */
  readonly tool: ToolDefinition;
}

/**
 * Visual card displaying a tool definition with call volume and latency metrics.
 */
export function ToolCard({ tool }: ToolCardProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="text-primary size-4" />
            <CardTitle className="font-mono text-sm font-semibold">{tool.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {tool.category}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground line-clamp-2 text-xs">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex items-center justify-between pt-4 font-mono text-xs">
        <span>{tool.runs.toLocaleString()} calls</span>
        <span className="text-primary font-semibold">{tool.avgLatency}</span>
      </CardContent>
    </Card>
  );
}
