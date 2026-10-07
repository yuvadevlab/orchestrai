"use client";

/**
 * @file studio-workspace-selector.tsx
 * @description Workspace folder selector and recent workspaces history manager matching Claude & Cursor UX.
 * @module apps/console/features/studio/components
 */

import React, { useState, useRef, useEffect } from "react";
import { Folder, ChevronDown, Plus, FolderOpen, Copy } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useConsoleStore, type WorkspaceRecord } from "@/lib/stores";
import { StudioWorkspaceRecentList } from "./studio-workspace-recent-list";

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

  const handleSubmitPath = (e: React.FormEvent): void => {
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
    <div className="relative inline-block text-left" ref={popoverRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:border-primary/40 h-8 max-w-55 gap-1.5 px-2.5 font-mono text-xs"
        title={activeWorkspace?.path || UI_COPY.STUDIO.WORKSPACE.SWITCH_TOOLTIP}
      >
        <Folder className="text-primary size-3.5 shrink-0" />
        <span className="truncate font-semibold">{displayName}</span>
        <ChevronDown className="text-muted-foreground ml-0.5 size-3 shrink-0" />
      </Button>

      {isOpen && (
        <div className="border-border bg-card text-card-foreground animate-in fade-in-50 zoom-in-95 absolute top-10 left-0 z-50 w-80 rounded-md border p-2 shadow-xl backdrop-blur-md">
          {/* Active Workspace Header */}
          <div className="border-border/60 border-b px-1 pb-2">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium">
              <span>{UI_COPY.STUDIO.WORKSPACE.ACTIVE_WORKSPACE}</span>
              {activeWorkspace?.path && (
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="hover:text-foreground inline-flex items-center gap-1 font-mono text-[10px]"
                >
                  <Copy className="size-2.5" />
                  {copied ? UI_COPY.COMMON.ACTIONS.COPIED : UI_COPY.STUDIO.WORKSPACE.COPY_PATH}
                </button>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
              <FolderOpen className="text-primary size-4" />
              <span className="truncate">
                {activeWorkspace?.name || UI_COPY.STUDIO.WORKSPACE.SELECT_WORKSPACE}
              </span>
            </div>
            {activeWorkspace?.path && (
              <p
                className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]"
                title={activeWorkspace.path}
              >
                {activeWorkspace.path}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePickDirectory}
              className="h-7 justify-center gap-1 font-mono text-xs"
            >
              <Plus className="size-3" />
              <span>{UI_COPY.STUDIO.WORKSPACE.OPEN_FOLDER}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnteringPath(!isEnteringPath)}
              className="h-7 justify-center gap-1 font-mono text-xs"
            >
              <span>{UI_COPY.STUDIO.WORKSPACE.ENTER_PATH}</span>
            </Button>
          </div>

          {/* Manual Path Input form */}
          {isEnteringPath && (
            <form onSubmit={handleSubmitPath} className="pb-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  placeholder={UI_COPY.STUDIO.WORKSPACE.PATH_PLACEHOLDER}
                  className="border-border bg-background flex-1 rounded border px-2 py-1 font-mono text-xs outline-none"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-7 px-2 text-xs">
                  {UI_COPY.STUDIO.WORKSPACE.OPEN_BUTTON}
                </Button>
              </div>
            </form>
          )}

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
