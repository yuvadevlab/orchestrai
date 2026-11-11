"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@orchestrai/ui";
import { Plus, Wrench } from "lucide-react";
import { ToolCard } from "./tool-card";
import { ToolDialog } from "./tool-dialog";
import { useTools, useToggleTool, useToolCategories } from "@/features/tools/api";
import { EmptyState } from "@orchestrai/ui";
import { CardGridSkeleton } from "@orchestrai/ui/components/skeleton";
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
          style={{
            height: "2rem",
            cursor: "pointer",
            gap: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.TOOLS.REGISTER_BUTTON}</span>
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
              >
                <Plus style={{ marginRight: "0.375rem", width: "0.875rem", height: "0.875rem" }} />{" "}
                {UI_COPY.TOOLS.REGISTER_BUTTON}
              </Button>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {groupedTools.map((g) => (
              <section
                key={g.group}
                style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
              >
                <div>
                  <h2
                    style={{
                      color: "var(--foreground)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      margin: 0,
                    }}
                  >
                    {g.group}
                  </h2>
                  <p
                    style={{
                      color: "var(--mutedForeground)",
                      marginTop: "0.125rem",
                      fontSize: "0.75rem",
                      marginInline: 0,
                      marginBottom: 0,
                    }}
                  >
                    {g.blurb}
                  </p>
                </div>
                <div className="orch-tool-grid">
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
