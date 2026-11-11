"use client";

/**
 * @file artifact-code-card.tsx
 * @description Code artifact view with syntax highlighting, line count, language badge, and copy.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { Check, ChevronDown, ChevronRight, Code2, Copy, PanelRightOpen } from "lucide-react";
import { Badge, Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useConsoleStore } from "@/lib/stores";
import type { CoworkArtifact } from "../../types";

export interface ArtifactCodeCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders a syntax-styled code or diff artifact (default collapsed).
 */
export function ArtifactCodeCard({ artifact }: ArtifactCodeCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const setActiveArtifact = useConsoleStore((s) => s.setActiveArtifact);
  const setCanvasMode = useConsoleStore((s) => s.setCanvasMode);

  const lines = artifact.content.split("\n");
  const language = artifact.language || artifact.filePath?.split(".").pop() || "typescript";

  const handleCopy = (): void => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInCanvas = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const isHtml = language === "html" || artifact.filePath?.endsWith(".html");
    setCanvasMode(isHtml ? "preview" : "code");
    setActiveArtifact({
      id: artifact.id,
      title: artifact.title,
      language,
      code: artifact.content,
    });
  };

  return (
    <div className="orch-artifact-card">
      {/* Code Header */}
      <div className={`orch-artifact-header ${isExpanded ? "is-expanded" : ""}`}>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="orch-artifact-trigger"
        >
          <Code2
            className="orch-text-primary"
            style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
          />
          <span className="orch-truncate orch-font-semibold">{artifact.title}</span>
          {artifact.filePath && (
            <span className="orch-text-muted orch-truncate" style={{ fontSize: "0.6875rem" }}>
              {artifact.filePath}
            </span>
          )}
          <span
            className="orch-flex-row orch-gap-xs orch-text-muted"
            style={{ fontSize: "0.625rem", alignItems: "center", marginLeft: "0.25rem" }}
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
            style={{ padding: "0 0.375rem", fontSize: "0.625rem", textTransform: "uppercase" }}
          >
            {UI_COPY.STUDIO.ARTIFACTS.LINES_COUNT(language, lines.length)}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInCanvas}
            style={{
              height: "1.75rem",
              cursor: "pointer",
              gap: "0.25rem",
              padding: "0 0.5rem",
              fontSize: "0.75rem",
            }}
            title={UI_COPY.STUDIO.ARTIFACTS.OPEN_CANVAS_TOOLTIP}
            aria-label={UI_COPY.STUDIO.ARTIFACTS.OPEN_CANVAS_TOOLTIP}
          >
            <PanelRightOpen
              className="orch-text-primary"
              style={{ width: "0.75rem", height: "0.75rem" }}
            />
            <span>{UI_COPY.STUDIO.ARTIFACTS.OPEN_CANVAS}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            style={{ height: "1.75rem", gap: "0.25rem", padding: "0 0.5rem", fontSize: "0.75rem" }}
          >
            {copied ? (
              <Check
                className="orch-text-primary"
                style={{ width: "0.75rem", height: "0.75rem" }}
              />
            ) : (
              <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
            )}
            <span>{copied ? UI_COPY.COMMON.ACTIONS.COPIED : UI_COPY.COMMON.ACTIONS.COPY}</span>
          </Button>
        </div>
      </div>

      {/* Code Body */}
      {isExpanded && (
        <div className="orch-artifact-code">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{artifact.content}</pre>
        </div>
      )}
    </div>
  );
}
