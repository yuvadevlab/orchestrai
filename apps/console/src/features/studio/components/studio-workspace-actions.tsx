"use client";

/**
 * @file studio-workspace-actions.tsx
 * @description Folder picker and manual path input actions for workspace selector.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface StudioWorkspaceActionsProps {
  readonly onPickDirectory: () => void;
  readonly isEnteringPath: boolean;
  readonly onToggleEnteringPath: () => void;
  readonly pathInput: string;
  readonly onPathInputChange: (value: string) => void;
  readonly onSubmitPath: (e: React.SyntheticEvent) => void;
}

/**
 * Workspace action buttons and conditional manual path input form.
 */
export function StudioWorkspaceActions({
  onPickDirectory,
  isEnteringPath,
  onToggleEnteringPath,
  pathInput,
  onPathInputChange,
  onSubmitPath,
}: StudioWorkspaceActionsProps): React.JSX.Element {
  return (
    <>
      <div className="orch-workspace-actions-grid">
        <Button
          variant="outline"
          size="sm"
          onClick={onPickDirectory}
          className="orch-font-mono"
          style={{
            height: "1.75rem",
            justifyContent: "center",
            gap: "0.25rem",
            fontSize: "0.75rem",
          }}
        >
          <Plus style={{ width: "0.75rem", height: "0.75rem" }} />
          <span>{UI_COPY.STUDIO.WORKSPACE.OPEN_FOLDER}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleEnteringPath}
          className="orch-font-mono"
          style={{
            height: "1.75rem",
            justifyContent: "center",
            gap: "0.25rem",
            fontSize: "0.75rem",
          }}
        >
          <span>{UI_COPY.STUDIO.WORKSPACE.ENTER_PATH}</span>
        </Button>
      </div>

      {isEnteringPath && (
        <form onSubmit={onSubmitPath} style={{ paddingBottom: "0.5rem" }}>
          <div className="orch-flex-row orch-gap-xs">
            <input
              type="text"
              value={pathInput}
              onChange={(e) => onPathInputChange(e.target.value)}
              placeholder={UI_COPY.STUDIO.WORKSPACE.PATH_PLACEHOLDER}
              style={{
                flex: 1,
                borderRadius: "var(--radius-sm, 0.25rem)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                padding: "0.25rem 0.5rem",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                outline: "none",
              }}
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              style={{ height: "1.75rem", padding: "0 0.5rem", fontSize: "0.75rem" }}
            >
              {UI_COPY.STUDIO.WORKSPACE.OPEN_BUTTON}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
