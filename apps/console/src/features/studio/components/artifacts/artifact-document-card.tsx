"use client";

/**
 * @file artifact-document-card.tsx
 * @description Document artifact view for PRDs, executive memos, and reports with copy and download.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { Check, Copy, Download, FileText } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import type { CoworkArtifact } from "../../types";

export interface ArtifactDocumentCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders a structured document or report artifact.
 */
export function ArtifactDocumentCard({ artifact }: ArtifactDocumentCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

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
    <div className="border-border/80 bg-card/70 my-3 overflow-hidden rounded-md border shadow-sm">
      {/* Document Header */}
      <div className="border-border/60 bg-muted/30 flex items-center justify-between border-b px-4 py-2.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <FileText className="text-primary size-4" />
          <span className="text-foreground font-semibold">{artifact.title}</span>
          <span className="text-muted-foreground text-[11px]">({wordCount} words)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1 px-2 text-xs">
            {copied ? <Check className="text-primary size-3" /> : <Copy className="size-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Download className="size-3" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Document Body */}
      <div className="bg-background/40 text-foreground p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">
        {artifact.content}
      </div>
    </div>
  );
}
