import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@yuva-devlab/ui";
import { Cpu, CheckCircle2 } from "lucide-react";
import type { ModelDefinition } from "../types";

/**
 * Props for ModelCard component.
 */
export interface ModelCardProps {
  /** Model definition */
  readonly model: ModelDefinition;
}

/**
 * Visual card displaying an LLM model provider endpoint with pricing and latency.
 */
export function ModelCard({ model }: ModelCardProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-primary size-4" />
            <CardTitle className="font-mono text-sm font-semibold">{model.id}</CardTitle>
          </div>
          <Badge variant="default" className="gap-1 font-mono text-[10px]">
            <CheckCircle2 className="size-3" />
            <span>{model.status}</span>
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          {model.provider}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex items-center justify-between pt-4 font-mono text-xs">
        <span>Pricing: {model.cost} (1M tok)</span>
        <span className="text-primary font-semibold">{model.latency}</span>
      </CardContent>
    </Card>
  );
}
