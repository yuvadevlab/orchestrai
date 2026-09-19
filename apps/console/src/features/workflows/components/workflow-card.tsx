import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from "@yuva-devlab/ui";
import { GitBranch, Play } from "lucide-react";
import type { WorkflowDefinition } from "../types";

/**
 * Props for the WorkflowCard component.
 */
export interface WorkflowCardProps {
  /** The workflow entity to render */
  readonly workflow: WorkflowDefinition;
  /** Optional callback when test run is triggered */
  readonly onRun?: (id: string) => void;
}

/**
 * Visual card displaying an individual DAG workflow with node metrics and status.
 */
export function WorkflowCard({ workflow, onRun }: WorkflowCardProps): React.JSX.Element {
  const isRunningActive = workflow.status === "ACTIVE";

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="text-primary size-4" />
            <CardTitle className="text-sm font-semibold">{workflow.name}</CardTitle>
          </div>
          <Badge
            variant={isRunningActive ? "default" : "outline"}
            className="font-mono text-[10px]"
          >
            {workflow.status}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground font-mono text-xs">
          {workflow.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex items-center justify-between pt-4 font-mono text-xs">
        <span>{workflow.nodes} DAG Nodes</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => onRun?.(workflow.id)}
        >
          <Play className="size-3" />
          <span>Test Run</span>
        </Button>
      </CardContent>
    </Card>
  );
}
