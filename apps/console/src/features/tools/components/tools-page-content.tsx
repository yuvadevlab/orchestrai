"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@yuva-devlab/ui";
import { Plus, Wrench } from "lucide-react";
import { ToolCard } from "./tool-card";
import { ToolDialog } from "./tool-dialog";
import { useTools, useToggleTool } from "@/features/tools/api";
import { EmptyState } from "@/components/ui";
import { PageShell } from "@/components/layout/page-shell";
import type { ToolDefinition } from "../types";

/**
 * Contextual descriptive blurbs for known platform tool domains.
 */
const CATEGORY_BLURBS: Record<string, string> = {
  "Web & Search": "Reach the live internet with grounded, cited retrieval.",
  "Documents & Data": "Author artifacts and interrogate structured data.",
  "Computation & APIs": "Execute code and talk to external systems safely.",
  Filesystem: "Inspect and mutate workspace documents and repositories safely.",
};

/**
 * Registered tool grouping structure.
 */
interface ToolGroup {
  readonly group: string;
  readonly blurb: string;
  readonly tools: ToolDefinition[];
}

/**
 * Tool Registry view matching orchestrai-src design:
 * Dynamically groups capabilities into permissioned categories without calls/ms metrics.
 */
export function ToolsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: tools = [], isLoading, refetch } = useTools();
  const toggleMutation = useToggleTool();

  // Dynamically group database tools by their category classification
  const groupedTools = useMemo<ToolGroup[]>(() => {
    const map = new Map<string, ToolDefinition[]>();

    for (const tool of tools) {
      const category = tool.category || "General";
      const existing = map.get(category);
      if (existing) {
        existing.push(tool);
      } else {
        map.set(category, [tool]);
      }
    }

    return Array.from(map.entries()).map(([group, groupTools]) => ({
      group,
      blurb:
        CATEGORY_BLURBS[group] ??
        `${groupTools.length} sandboxed capabilities and integrations available to specialists.`,
      tools: groupTools,
    }));
  }, [tools]);

  /**
   * Handles toggling a tool's enablement state in the live database.
   */
  const handleToggle = (tool: ToolDefinition, isEnabled: boolean): void => {
    if (!tool.toolId) return;
    toggleMutation.mutate({
      toolId: tool.toolId,
      isEnabled,
      name: tool.name,
    });
  };

  return (
    <PageShell
      title="Tools & Integrations"
      breadcrumb="Tools"
      stats={`${tools.length} capabilities active`}
      description="Permissioned capabilities available to every specialist."
      actions={
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Register tool</span>
        </Button>
      }
    >
      <div className="space-y-8">
        {isLoading ? (
          <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
            <span className="text-muted-foreground animate-pulse text-xs">
              Loading permissioned capabilities...
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
                className="h-8 cursor-pointer text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> Register Custom Tool
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {groupedTools.map((g) => (
              <section key={g.group} className="space-y-3">
                <div>
                  <h2 className="text-foreground text-sm font-semibold tracking-tight">
                    {g.group}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">{g.blurb}</p>
                </div>
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                  {g.tools.map((t) => (
                    <ToolCard
                      key={t.toolId ?? t.slug ?? t.name}
                      tool={t}
                      onToggle={(checked) => handleToggle(t, checked)}
                      isPending={toggleMutation.isPending}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <ToolDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            void refetch();
          }}
        />
      </div>
    </PageShell>
  );
}
