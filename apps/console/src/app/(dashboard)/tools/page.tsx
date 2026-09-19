import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { tools } from "@/lib/mock-db";

/**
 * Tool capability registry with categories, permissions, and latency metrics.
 */
export default function ToolsPage(): React.JSX.Element {
  const categories = [...new Set(tools.map((tool) => tool.category))];

  return (
    <PageShell
      title="Tools"
      breadcrumb="Tools"
      description="Everything the orchestrator is allowed to reach for, and the guardrails attached to each."
    >
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
              {category}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {tools
                .filter((tool) => tool.category === category)
                .map((tool) => (
                  <Panel key={tool.id}>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-mono text-xs font-semibold">{tool.name}</p>
                      <span className="ml-auto">
                        <StatusChip status={tool.status} />
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tool.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="border-border text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                    <p className="border-border text-muted-foreground mt-3 border-t pt-2 font-mono text-[10px]">
                      {tool.calls30d.toLocaleString()} calls / 30d · {tool.avgLatency} avg latency
                    </p>
                  </Panel>
                ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
