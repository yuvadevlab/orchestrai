"use client";

/**
 * @file apps/console/src/features/memory/components/memory-items-list.tsx
 * @description List view of all persisted agent memories, episodic reflections, and user facts.
 * @module apps/console/features/memory/components
 */

import React from "react";
import { Brain, Trash2, Calendar, Star } from "lucide-react";
import { Button, toast } from "@orchestrai/ui";
import { EmptyState } from "@orchestrai/ui";
import { TableSkeleton } from "@orchestrai/ui/components/skeleton";
import { UI_COPY } from "@/lib/ui-copy";
import { useDeleteMemory } from "../api";
import type { MemoryItem } from "../types";

export interface MemoryItemsListProps {
  readonly memories: MemoryItem[];
  readonly isLoading: boolean;
  readonly onOpenCreate: () => void;
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
      toast.success(UI_COPY.MEMORY.LIST.FEEDBACK_REMOVED);
    } catch {
      toast.error(UI_COPY.MEMORY.LIST.FEEDBACK_ERROR);
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={4} />;
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title={UI_COPY.MEMORY.EMPTY_TITLE}
        description={UI_COPY.MEMORY.EMPTY_DESC}
        action={
          <Button
            size="sm"
            onClick={onOpenCreate}
            style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
          >
            <Brain style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>{UI_COPY.MEMORY.LIST.ADD_FIRST}</span>
          </Button>
        }
      />
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "color-mix(in oklab, var(--card) 40%, transparent)",
        borderRadius: "var(--radius-md, 0.375rem)",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {memories.map((mem) => {
          const importancePct = Math.round((mem.importanceScore ?? 0.5) * 100);
          return (
            <div
              key={mem.memoryId}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                padding: "1rem",
                borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
                transition: "background-color 150ms ease",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}
                >
                  <span
                    style={{
                      border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                      backgroundColor: "color-mix(in oklab, var(--muted) 60%, transparent)",
                      color: "var(--mutedForeground)",
                      borderRadius: "var(--radius-sm, 0.25rem)",
                      paddingInline: "0.375rem",
                      paddingBlock: "0.125rem",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {mem.memoryType}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.6875rem",
                    }}
                  >
                    <Star
                      style={{
                        color: "var(--warning, #eab308)",
                        width: "0.75rem",
                        height: "0.75rem",
                      }}
                    />
                    <span
                      style={{
                        color: "var(--mutedForeground)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.625rem",
                      }}
                    >
                      {UI_COPY.MEMORY.LIST.PRIORITY_PCT(importancePct)}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "var(--mutedForeground)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.6875rem",
                    }}
                  >
                    <Calendar style={{ width: "0.75rem", height: "0.75rem" }} />
                    <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p
                  style={{
                    color: "var(--foreground)",
                    marginTop: "0.5rem",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
                    marginInline: 0,
                    marginBottom: 0,
                  }}
                >
                  {mem.content}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(mem)}
                  disabled={deleteMutation.isPending}
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    color: "var(--mutedForeground)",
                    borderRadius: "var(--radius-sm, 0.25rem)",
                  }}
                  title={UI_COPY.MEMORY.LIST.DELETE_TOOLTIP}
                  aria-label={UI_COPY.MEMORY.LIST.DELETE_TOOLTIP}
                >
                  <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
