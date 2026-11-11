"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-pane.tsx
 * @description Master Dual-Pane Workspace Canvas container rendering Code, Preview, Diff, or Terminal.
 * @module apps/console/features/studio/components/canvas
 */

import React from "react";
import { Code, Eye, GitCompare, Terminal, X } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
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
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
  }[] = [
    { mode: "code", label: UI_COPY.STUDIO.CANVAS.TABS.CODE, icon: Code },
    { mode: "preview", label: UI_COPY.STUDIO.CANVAS.TABS.PREVIEW, icon: Eye },
    { mode: "diff", label: UI_COPY.STUDIO.CANVAS.TABS.DIFF, icon: GitCompare },
    { mode: "terminal", label: UI_COPY.STUDIO.CANVAS.TABS.TERMINAL, icon: Terminal },
  ];

  return (
    <div className="orch-canvas-pane">
      {/* Canvas Top Bar */}
      <div className="orch-canvas-header">
        {/* Title */}
        <div
          className="orch-flex-row orch-gap-xs"
          style={{ alignItems: "center", minWidth: 0, paddingRight: "1rem" }}
        >
          <span className="orch-truncate orch-font-semibold" style={{ fontSize: "0.875rem" }}>
            {activeArtifact.title}
          </span>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="orch-canvas-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = canvasMode === tab.mode;
            return (
              <button
                key={tab.mode}
                type="button"
                onClick={() => setCanvasMode(tab.mode)}
                className={`orch-canvas-tab ${isActive ? "is-active" : ""}`}
              >
                <Icon style={{ width: "0.875rem", height: "0.875rem" }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setCanvasOpen(false)}
          className="orch-text-muted"
          style={{
            marginLeft: "0.75rem",
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.25rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title={UI_COPY.STUDIO.CANVAS.CLOSE_A11Y}
          aria-label={UI_COPY.STUDIO.CANVAS.CLOSE_A11Y}
        >
          <X style={{ width: "1rem", height: "1rem" }} />
        </button>
      </div>

      {/* Canvas Content Body */}
      <div className="orch-canvas-body">
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
