"use client";

/**
 * @file studio-workspace-selector.tsx
 * @description Workspace folder selector and recent workspaces history manager matching Claude & Cursor UX.
 * @module apps/console/features/studio/components
 */

import React, { useState, useRef, useEffect } from "react";
import { Folder, ChevronDown, FolderOpen, Copy } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useConsoleStore, type WorkspaceRecord } from "@/lib/stores";
import { StudioWorkspaceRecentList } from "./studio-workspace-recent-list";
import { StudioWorkspaceActions } from "./studio-workspace-actions";

/**
 * Renders an active workspace folder picker and recent workspace history dropdown.
 */
export function StudioWorkspaceSelector(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnteringPath, setIsEnteringPath] = useState(false);
  const [pathInput, setPathInput] = useState("");
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = useConsoleStore((s) => s.activeWorkspace);
  const recentWorkspaces = useConsoleStore((s) => s.recentWorkspaces);
  const setActiveWorkspace = useConsoleStore((s) => s.setActiveWorkspace);
  const openWorkspaceByPath = useConsoleStore((s) => s.openWorkspaceByPath);
  const removeRecentWorkspace = useConsoleStore((s) => s.removeRecentWorkspace);
  const clearWorkspaceHistory = useConsoleStore((s) => s.clearWorkspaceHistory);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEnteringPath(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handlePickDirectory = async (): Promise<void> => {
    try {
      if ("showDirectoryPicker" in window) {
        const picker = window as unknown as {
          showDirectoryPicker: () => Promise<{ name: string }>;
        };
        const handle = await picker.showDirectoryPicker();
        if (handle?.name) {
          openWorkspaceByPath(handle.name, handle.name);
          setIsOpen(false);
        }
      } else {
        setIsEnteringPath(true);
      }
    } catch {
      // User cancelled picker or permission rejected
    }
  };

  const handleSubmitPath = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    if (!pathInput.trim()) return;
    openWorkspaceByPath(pathInput.trim());
    setPathInput("");
    setIsEnteringPath(false);
    setIsOpen(false);
  };

  const handleCopyPath = (): void => {
    if (!activeWorkspace?.path) return;
    void navigator.clipboard.writeText(activeWorkspace.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = activeWorkspace?.name || UI_COPY.STUDIO.WORKSPACE.SELECT_WORKSPACE;

  return (
    <div
      style={{ position: "relative", display: "inline-block", textAlign: "left" }}
      ref={popoverRef}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="orch-font-mono"
        style={{
          height: "2rem",
          maxWidth: "14rem",
          gap: "0.375rem",
          padding: "0 0.625rem",
          fontSize: "0.75rem",
        }}
        title={activeWorkspace?.path || UI_COPY.STUDIO.WORKSPACE.SWITCH_TOOLTIP}
      >
        <Folder
          className="orch-text-primary"
          style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
        />
        <span className="orch-truncate orch-font-semibold">{displayName}</span>
        <ChevronDown
          className="orch-text-muted"
          style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0 }}
        />
      </Button>

      {isOpen && (
        <div className="orch-workspace-popover">
          {/* Active Workspace Header */}
          <div className="orch-workspace-header">
            <div
              className="orch-flex-row orch-justify-between orch-text-muted"
              style={{ fontSize: "0.6875rem", fontWeight: 500 }}
            >
              <span>{UI_COPY.STUDIO.WORKSPACE.ACTIVE_WORKSPACE}</span>
              {activeWorkspace?.path && (
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="orch-flex-row orch-gap-xs orch-font-mono orch-text-muted"
                  style={{
                    alignItems: "center",
                    fontSize: "0.625rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Copy style={{ width: "0.625rem", height: "0.625rem" }} />
                  {copied ? UI_COPY.COMMON.ACTIONS.COPIED : UI_COPY.STUDIO.WORKSPACE.COPY_PATH}
                </button>
              )}
            </div>
            <div
              className="orch-flex-row orch-gap-xs"
              style={{
                alignItems: "center",
                marginTop: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              <FolderOpen className="orch-text-primary" style={{ width: "1rem", height: "1rem" }} />
              <span className="orch-truncate">
                {activeWorkspace?.name || UI_COPY.STUDIO.WORKSPACE.SELECT_WORKSPACE}
              </span>
            </div>
            {activeWorkspace?.path && (
              <p
                className="orch-text-muted orch-truncate orch-font-mono"
                style={{ margin: 0, marginTop: "0.125rem", fontSize: "0.625rem" }}
                title={activeWorkspace.path}
              >
                {activeWorkspace.path}
              </p>
            )}
          </div>

          {/* Action Buttons & Manual Path Input */}
          <StudioWorkspaceActions
            onPickDirectory={handlePickDirectory}
            isEnteringPath={isEnteringPath}
            onToggleEnteringPath={() => setIsEnteringPath(!isEnteringPath)}
            pathInput={pathInput}
            onPathInputChange={setPathInput}
            onSubmitPath={handleSubmitPath}
          />

          {/* Recent Workspaces List */}
          <StudioWorkspaceRecentList
            recentWorkspaces={recentWorkspaces}
            activeWorkspace={activeWorkspace}
            onSelect={(ws: WorkspaceRecord) => {
              setActiveWorkspace(ws);
              setIsOpen(false);
            }}
            onRemove={removeRecentWorkspace}
            onClear={clearWorkspaceHistory}
          />
        </div>
      )}
    </div>
  );
}
