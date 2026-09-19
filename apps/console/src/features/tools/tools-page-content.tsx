"use client";

import React, { useState } from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Plus } from "lucide-react";
import { ToolCard } from "./components/tool-card";
import { MOCK_TOOLS } from "./mock-tools";

/**
 * Main feature container view for Tool Registry.
 */
export function ToolsPageContent(): React.JSX.Element {
  const [tools] = useState(MOCK_TOOLS);

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
        <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Register Tool</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.name} tool={t} />
        ))}
      </div>
    </div>
  );
}
