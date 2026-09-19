"use client";

import React, { useState } from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Plus } from "lucide-react";
import { WorkflowCard } from "./components/workflow-card";
import { MOCK_WORKFLOWS } from "./mock-workflows";

/**
 * Main feature container view for Workflows Canvas.
 */
export function WorkflowsPageContent(): React.JSX.Element {
  const [workflows] = useState(MOCK_WORKFLOWS);

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Workflow Canvas</h1>
            <Badge variant="outline" className="font-mono text-xs">
              Visual DAG Builder
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Construct composable agent execution pipelines with conditional branches and
            checkpoints.
          </p>
        </div>
        <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>New Workflow</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} />
        ))}
      </div>
    </div>
  );
}
