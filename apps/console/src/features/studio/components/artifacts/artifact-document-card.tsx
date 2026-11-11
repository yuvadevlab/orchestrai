"use client";

/**
 * @file artifact-document-card.tsx
 * @description Document artifact view for PRDs, executive memos, and reports with copy and download.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy, Download, FileText } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { CoworkArtifact } from "../../types";

export interface ArtifactDocumentCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders a structured document or report artifact (default collapsed).
 */
export function ArtifactDocumentCard({ artifact }: ArtifactDocumentCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const wordCount = artifact.content.trim().split(/\s+/).length;

  const handleCopy = (): void => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (): void => {
    const blob = new Blob([artifact.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = artifact.filePath || `${artifact.title.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="orch-artifact-card">
      {/* Document Header */}
      <div className={`orch-artifact-header ${isExpanded ? "is-expanded" : ""}`}>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="orch-artifact-trigger"
        >
          <FileText
            className="orch-text-primary"
            style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
          />
          <span className="orch-truncate orch-font-semibold">{artifact.title}</span>
          <span className="orch-text-muted" style={{ fontSize: "0.6875rem" }}>
            {UI_COPY.STUDIO.ARTIFACTS.WORDS_COUNT(wordCount)}
          </span>
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            style={{ height: "1.75rem", gap: "0.25rem", padding: "0 0.5rem", fontSize: "0.75rem" }}
          >
            <Download style={{ width: "0.75rem", height: "0.75rem" }} />
            <span>{UI_COPY.STUDIO.ARTIFACTS.DOWNLOAD_BUTTON}</span>
          </Button>
        </div>
      </div>

      {/* Document Body */}
      {isExpanded && (
        <div className="orch-artifact-body" style={{ whiteSpace: "pre-wrap" }}>
          {artifact.content}
        </div>
      )}
    </div>
  );
}
