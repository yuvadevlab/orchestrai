"use client";

/**
 * @file workflows-page-content.tsx
 * @description Workflow Canvas view with EmptyState support and live DAG topology creation.
 * @module apps/console/features/workflows/components
 */

import React, { useState } from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Plus, GitBranch } from "lucide-react";
import { WorkflowCard } from "./workflow-card";
import { WorkflowDialog } from "./workflow-dialog";
import { useWorkflows } from "@/features/workflows/api";
import { EmptyState } from "@/components/ui";

export function WorkflowsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: workflows, isLoading, refetch } = useWorkflows();

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Workflow Canvas</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {workflows.length} DAGs
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Construct composable agent execution pipelines with conditional branches and
            checkpoints.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>New Workflow</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading workflow graphs...
          </span>
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No Workflows Created"
          description="Compose visual agent DAG pipelines with custom triggers and output nodes."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="h-8 cursor-pointer font-mono text-xs"
            >
              <Plus className="mr-1.5 size-3.5" /> Build New Workflow
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      )}

      <WorkflowDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
