"use client";

/**
 * @file memory-page-content.tsx
 * @description Agent working, long-term, and semantic memory inspection view with EmptyState support.
 * @module apps/console/features/memory/components
 */

import React, { useState } from "react";
import { Button, Panel } from "@yuva-devlab/ui";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemory } from "../api";
import { EmptyState } from "@/components/ui/empty-state";

const SCOPES = ["all", "working", "long-term", "semantic"] as const;

export function MemoryPageContent(): React.JSX.Element {
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("all");
  const { data: memories, isLoading } = useMemory();
  const visible = memories.filter((record) => scope === "all" || record.scope === scope);

  if (isLoading) {
    return (
      <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
        <span className="text-muted-foreground animate-pulse font-mono text-xs">
          Loading agent memory stores...
        </span>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No Memory Records Stored"
        description="Working context, long-term facts, and vector semantic memories will be displayed here as agents process tasks."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {SCOPES.map((item) => (
          <Button
            key={item}
            variant={scope === item ? "default" : "outline"}
            size="sm"
            onClick={() => setScope(item)}
            className={cn(
              "h-7 px-2.5 font-mono text-[10px] capitalize",
              scope !== item && "text-muted-foreground",
            )}
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((record) => (
          <Panel key={record.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="border-primary/25 bg-primary/5 text-primary rounded border px-1.5 py-0.5 font-mono text-[10px]">
                  {record.scope}
                </span>
                <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                  {Math.round(record.confidence * 100)}% confidence
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold">{record.title}</p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{record.body}</p>
            </div>

            <div className="mt-4">
              <div className="bg-secondary h-1 overflow-hidden rounded">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${record.confidence * 100}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-2 font-mono text-[10px]">
                {record.source} · created {record.createdAt} · recalled {record.lastAccessed}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
