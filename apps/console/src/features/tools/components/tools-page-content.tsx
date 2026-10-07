"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@yuva-devlab/ui";
import { Plus, Wrench } from "lucide-react";
import { ToolCard } from "./tool-card";
import { ToolDialog } from "./tool-dialog";
import { useTools, useToggleTool, useToolCategories } from "@/features/tools/api";
import { EmptyState } from "@/components/ui";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/layout/page-shell";
import { UI_COPY } from "@/lib/ui-copy";
import type { ToolDefinition } from "../types";

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
 * Contextual category blurbs are dynamically driven by server-side platform configurations.
 */
export function ToolsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: tools = [], isLoading, refetch } = useTools();
  const { data: categoryBlurbs = {} } = useToolCategories();
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
        categoryBlurbs[group] ??
        `${groupTools.length} sandboxed capabilities and integrations available to specialists.`,
      tools: groupTools,
    }));
  }, [tools, categoryBlurbs]);

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
      title={UI_COPY.TOOLS.PAGE_TITLE}
      breadcrumb={UI_COPY.TOOLS.BREADCRUMB}
      stats={UI_COPY.TOOLS.STATS(tools.length)}
      description={UI_COPY.TOOLS.PAGE_DESCRIPTION}
      actions={
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>{UI_COPY.TOOLS.REGISTER_BUTTON}</span>
        </Button>
      }
    >
      <div className="space-y-8">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : tools.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={UI_COPY.TOOLS.EMPTY_TITLE}
            description={UI_COPY.TOOLS.EMPTY_DESC}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-8 cursor-pointer text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> {UI_COPY.TOOLS.REGISTER_BUTTON}
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
