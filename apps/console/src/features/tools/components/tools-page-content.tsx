"use client";

/**
 * @file tools-page-content.tsx
 * @description Tool Registry view with EmptyState support and interactive tool registration.
 * @module apps/console/features/tools/components
 */

import React, { useState } from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Plus, Wrench } from "lucide-react";
import { ToolCard } from "./tool-card";
import { ToolDialog } from "./tool-dialog";
import { useTools } from "@/features/tools/api";
import { EmptyState } from "@/components/ui";

export function ToolsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: tools, isLoading, refetch } = useTools();

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Tool Registry</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {tools.length} Registered
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Extensible execution tools and plugins available to agents in the runtime environment.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Register Tool</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading tool registry...
          </span>
        </div>
      ) : tools.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Tools Registered"
          description="Register search tools, database connectors, or custom sandbox plugins for your agents."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="h-8 cursor-pointer font-mono text-xs"
            >
              <Plus className="mr-1.5 size-3.5" /> Register Custom Tool
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <ToolCard key={t.name} tool={t} />
          ))}
        </div>
      )}

      <ToolDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
