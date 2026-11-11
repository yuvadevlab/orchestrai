"use client";

/**
 * @file artifact-terminal-card.tsx
 * @description Terminal log window showing command, exit code, duration, and output stream.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Terminal,
  PanelRightOpen,
} from "lucide-react";
import { Badge, Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useConsoleStore } from "@/lib/stores";
import type { CoworkArtifact } from "../../types";

export interface ArtifactTerminalCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders a dark terminal execution box (default collapsed).
 */
export function ArtifactTerminalCard({ artifact }: ArtifactTerminalCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const setActiveArtifact = useConsoleStore((s) => s.setActiveArtifact);
  const setCanvasMode = useConsoleStore((s) => s.setCanvasMode);

  const handleCopy = (): void => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInCanvas = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setCanvasMode("terminal");
    setActiveArtifact({
      id: artifact.id,
      title: artifact.title,
      code: artifact.content,
      terminalLogs: artifact.content.split("\n"),
    });
  };

  return (
    <div className="orch-artifact-card">
      {/* Terminal Title Bar */}
      <div className={`orch-artifact-terminal-header ${isExpanded ? "is-expanded" : ""}`}>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="orch-artifact-trigger"
          style={{ color: "inherit" }}
        >
          <Terminal
            style={{
              width: "0.875rem",
              height: "0.875rem",
              flexShrink: 0,
              color: "var(--primary)",
            }}
          />
          <span className="orch-truncate orch-font-semibold">{artifact.title}</span>
          <span
            className="orch-flex-row orch-gap-xs"
            style={{
              fontSize: "0.625rem",
              alignItems: "center",
              marginLeft: "0.25rem",
              opacity: 0.7,
            }}
          >
            <span>{isExpanded ? UI_COPY.COMMON.ACTIONS.HIDE : UI_COPY.COMMON.ACTIONS.SHOW}</span>
            {isExpanded ? (
              <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} />
            ) : (
              <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
            )}
          </span>
        </button>

        <div className="orch-artifact-actions">
          <Badge
            variant="outline"
            className="orch-font-mono"
            style={{
              borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
              color: "var(--primary)",
              padding: "0 0.375rem",
              fontSize: "0.625rem",
            }}
          >
            <CheckCircle2 style={{ marginRight: "0.25rem", width: "0.75rem", height: "0.75rem" }} />
            exit 0
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInCanvas}
            style={{
              height: "1.5rem",
              cursor: "pointer",
              gap: "0.25rem",
              padding: "0 0.5rem",
              fontSize: "0.625rem",
            }}
            title={UI_COPY.STUDIO.ARTIFACTS.OPEN_CANVAS_TOOLTIP}
            aria-label={UI_COPY.STUDIO.ARTIFACTS.OPEN_CANVAS_TOOLTIP}
          >
            <PanelRightOpen
              style={{ width: "0.75rem", height: "0.75rem", color: "var(--primary)" }}
            />
            <span>{UI_COPY.STUDIO.ARTIFACTS.OPEN_CANVAS}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
            title={UI_COPY.STUDIO.ARTIFACTS.COPY_TERMINAL_TOOLTIP}
            aria-label={UI_COPY.STUDIO.ARTIFACTS.COPY_TERMINAL_TOOLTIP}
          >
            {copied ? (
              <Check
                className="orch-text-primary"
                style={{ width: "0.75rem", height: "0.75rem" }}
              />
            ) : (
              <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
            )}
          </Button>
        </div>
      </div>

      {/* Terminal Console Output */}
      {isExpanded && (
        <div className="orch-artifact-terminal-body">
          <div
            className="orch-flex-row orch-gap-xs"
            style={{ alignItems: "center", marginBottom: "0.5rem", opacity: 0.6 }}
          >
            <span style={{ color: "var(--primary)" }}>$</span>
            <span>{artifact.filePath || artifact.title}</span>
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{artifact.content}</pre>
        </div>
      )}
    </div>
  );
}
