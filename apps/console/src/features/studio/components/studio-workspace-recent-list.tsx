"use client";

/**
 * @file studio-workspace-recent-list.tsx
 * @description List view for recently opened workspaces with active state indicator and deletion.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { Folder, Check, Clock, Trash2 } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
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
    <div className="orch-workspace-recent-list">
      <div
        className="orch-flex-row orch-justify-between orch-text-muted orch-font-mono"
        style={{ padding: "0.25rem", fontSize: "0.6875rem" }}
      >
        <span className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <Clock style={{ width: "0.75rem", height: "0.75rem" }} />{" "}
          {UI_COPY.STUDIO.WORKSPACE.RECENTS_TITLE}
        </span>
        {recentWorkspaces.length > 1 && (
          <button
            type="button"
            onClick={onClear}
            className="orch-text-muted"
            style={{
              fontSize: "0.625rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
          >
            {UI_COPY.STUDIO.WORKSPACE.CLEAR_RECENTS}
          </button>
        )}
      </div>

      <div className="orch-workspace-recent-scroll">
        {recentWorkspaces.map((ws) => {
          const isActive = activeWorkspace?.id === ws.id || activeWorkspace?.path === ws.path;
          return (
            <div
              key={ws.id}
              className="orch-session-item"
              style={{
                backgroundColor: isActive
                  ? "color-mix(in oklab, var(--primary) 10%, transparent)"
                  : undefined,
                color: isActive ? "var(--primary)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(ws)}
                className="orch-flex-row orch-gap-xs"
                style={{
                  minWidth: 0,
                  flex: 1,
                  alignItems: "center",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                <Folder
                  style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0, opacity: 0.7 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="orch-truncate">{ws.name}</div>
                  {ws.path && (
                    <div
                      className="orch-text-muted orch-truncate orch-font-mono"
                      style={{ fontSize: "0.5625rem", opacity: 0.7 }}
                    >
                      {ws.path}
                    </div>
                  )}
                </div>
                {isActive && (
                  <Check style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0 }} />
                )}
              </button>

              {!isActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(ws.id);
                  }}
                  className="orch-text-muted"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.125rem",
                  }}
                  title={UI_COPY.STUDIO.WORKSPACE.REMOVE_TOOLTIP}
                  aria-label={UI_COPY.STUDIO.WORKSPACE.REMOVE_TOOLTIP}
                >
                  <Trash2 style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
