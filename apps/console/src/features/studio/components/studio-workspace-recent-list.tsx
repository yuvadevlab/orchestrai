"use client";

/**
 * @file studio-workspace-recent-list.tsx
 * @description List view for recently opened workspaces with active state indicator and deletion.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { Folder, Check, Clock, Trash2 } from "lucide-react";
import type { WorkspaceRecord } from "@/lib/stores";

export interface StudioWorkspaceRecentListProps {
  readonly recentWorkspaces: readonly WorkspaceRecord[];
  readonly activeWorkspace: WorkspaceRecord | null;
  readonly onSelect: (ws: WorkspaceRecord) => void;
  readonly onRemove: (id: string) => void;
  readonly onClear: () => void;
}

/**
 * Renders the recent workspaces history sub-panel.
 */
export function StudioWorkspaceRecentList({
  recentWorkspaces,
  activeWorkspace,
  onSelect,
  onRemove,
  onClear,
}: StudioWorkspaceRecentListProps): React.JSX.Element {
  return (
    <div className="border-border/60 border-t pt-1.5">
      <div className="text-muted-foreground flex items-center justify-between p-1 font-mono text-[11px]">
        <span className="flex items-center gap-1">
          <Clock className="size-3" /> Recent Workspaces
        </span>
        {recentWorkspaces.length > 1 && (
          <button
            type="button"
            onClick={onClear}
            className="hover:text-destructive text-[10px] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {recentWorkspaces.map((ws) => {
          const isActive = activeWorkspace?.id === ws.id || activeWorkspace?.path === ws.path;
          return (
            <div
              key={ws.id}
              className={`group flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/60 text-foreground"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(ws)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <Folder className="size-3.5 shrink-0 opacity-70" />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{ws.name}</div>
                  {ws.path && (
                    <div className="text-muted-foreground truncate font-mono text-[9px] opacity-70">
                      {ws.path}
                    </div>
                  )}
                </div>
                {isActive && <Check className="size-3 shrink-0" />}
              </button>

              {!isActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(ws.id);
                  }}
                  className="hover:text-destructive p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Remove from history"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
