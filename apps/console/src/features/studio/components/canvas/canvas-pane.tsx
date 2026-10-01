"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-pane.tsx
 * @description Master Dual-Pane Workspace Canvas container rendering Code, Preview, Diff, or Terminal.
 * @module apps/console/features/studio/components/canvas
 */

import React from "react";
import { Code, Eye, GitCompare, Terminal, X } from "lucide-react";
import { useConsoleStore, type CanvasMode } from "@/lib/stores";
import { CanvasCodeView } from "./canvas-code-view";
import { CanvasPreviewView } from "./canvas-preview-view";
import { CanvasDiffView } from "./canvas-diff-view";
import { CanvasTerminalView } from "./canvas-terminal-view";

export function CanvasPane(): React.JSX.Element | null {
  const isCanvasOpen = useConsoleStore((s) => s.isCanvasOpen);
  const canvasMode = useConsoleStore((s) => s.canvasMode);
  const activeArtifact = useConsoleStore((s) => s.activeArtifact);
  const draftCode = useConsoleStore((s) => s.draftCode);
  const setCanvasMode = useConsoleStore((s) => s.setCanvasMode);
  const setCanvasOpen = useConsoleStore((s) => s.setCanvasOpen);
  const updateActiveArtifactCode = useConsoleStore((s) => s.updateActiveArtifactCode);

  if (!isCanvasOpen || !activeArtifact) {
    return null;
  }

  const tabs: {
    mode: CanvasMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { mode: "code", label: "Code", icon: Code },
    { mode: "preview", label: "Preview", icon: Eye },
    { mode: "diff", label: "Diff", icon: GitCompare },
    { mode: "terminal", label: "Terminal", icon: Terminal },
  ];

  return (
    <div className="border-border bg-card flex size-full flex-col overflow-hidden border-l">
      {/* Canvas Top Bar */}
      <div className="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
        {/* Title */}
        <div className="flex items-center gap-2 truncate pr-4">
          <span className="truncate text-sm font-semibold">{activeArtifact.title}</span>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="bg-muted flex items-center rounded-lg p-0.5 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = canvasMode === tab.mode;
            return (
              <button
                key={tab.mode}
                type="button"
                onClick={() => setCanvasMode(tab.mode)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setCanvasOpen(false)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground ml-3 rounded-md p-1 transition-colors"
          title="Close Canvas"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Canvas Content Body */}
      <div className="flex-1 overflow-hidden">
        {canvasMode === "code" && (
          <CanvasCodeView
            code={draftCode || activeArtifact.code}
            language={activeArtifact.language}
            onChange={updateActiveArtifactCode}
          />
        )}
        {canvasMode === "preview" && (
          <CanvasPreviewView
            htmlContent={draftCode || activeArtifact.code}
            title={activeArtifact.title}
          />
        )}
        {canvasMode === "diff" && (
          <CanvasDiffView
            originalText={activeArtifact.diffOriginal || activeArtifact.code}
            modifiedText={draftCode || activeArtifact.diffModified || activeArtifact.code}
          />
        )}
        {canvasMode === "terminal" && (
          <CanvasTerminalView logs={activeArtifact.terminalLogs} command="bash -c 'build & test'" />
        )}
      </div>
    </div>
  );
}
