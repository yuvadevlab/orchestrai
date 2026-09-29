"use client";

/**
 * @file apps/console/src/features/memory/components/memory-items-list.tsx
 * @description List view of all persisted agent memories, episodic reflections, and user facts.
 * @module apps/console/features/memory/components
 */

import React from "react";
import { Brain, Trash2, Calendar, Star } from "lucide-react";
import { Button, toast } from "@yuva-devlab/ui";
import { EmptyState } from "@/components/ui";
import { useDeleteMemory } from "../api";
import type { MemoryItem } from "../types";

export interface MemoryItemsListProps {
  memories: MemoryItem[];
  isLoading: boolean;
  onOpenCreate: () => void;
}

/**
 * Renders stored memories with type badges, importance meters, and delete controls.
 */
export function MemoryItemsList({
  memories,
  isLoading,
  onOpenCreate,
}: MemoryItemsListProps): React.JSX.Element {
  const deleteMutation = useDeleteMemory();

  const handleDelete = async (memory: MemoryItem): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(memory.memoryId);
      toast.success("Memory deleted from persistent agent storage");
    } catch {
      toast.error("Failed to delete memory item");
    }
  };

  if (isLoading) {
    return (
      <div className="border-border bg-card/30 flex min-h-48 items-center justify-center rounded-md border backdrop-blur">
        <span className="text-muted-foreground animate-pulse text-xs">
          Loading agent memories...
        </span>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No persistent memories yet"
        description="Agents record episodic reflections after each execution, or you can record explicit facts manually."
        action={
          <Button size="sm" onClick={onOpenCreate} className="h-8 gap-1.5 text-xs font-medium">
            <Brain className="size-3.5" />
            <span>Add first memory</span>
          </Button>
        }
      />
    );
  }

  return (
    <div className="border-border bg-card/40 overflow-hidden rounded-md border backdrop-blur">
      <div className="divide-border/60 divide-y">
        {memories.map((mem) => {
          const importancePct = Math.round((mem.importanceScore ?? 0.5) * 100);
          return (
            <div
              key={mem.memoryId}
              className="hover:bg-muted/30 flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border-border/80 bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
                    {mem.memoryType}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Star className="text-warning size-3" />
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {importancePct}% priority
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3" />
                    <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-foreground/95 mt-2 font-mono text-xs leading-relaxed">
                  {mem.content}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(mem)}
                  disabled={deleteMutation.isPending}
                  className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground size-7 rounded"
                  title="Delete memory"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
