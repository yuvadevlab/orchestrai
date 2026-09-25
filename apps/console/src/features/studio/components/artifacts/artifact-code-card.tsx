"use client";

/**
 * @file artifact-code-card.tsx
 * @description Code artifact view with syntax highlighting, line count, language badge, and copy.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { Check, Code2, Copy } from "lucide-react";
import { Badge, Button } from "@yuva-devlab/ui";
import type { CoworkArtifact } from "../../types";

export interface ArtifactCodeCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders a syntax-styled code or diff artifact.
 */
export function ArtifactCodeCard({ artifact }: ArtifactCodeCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const lines = artifact.content.split("\n");
  const language = artifact.language || artifact.filePath?.split(".").pop() || "typescript";

  const handleCopy = (): void => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-border/80 bg-card/70 my-3 overflow-hidden rounded-md border shadow-sm">
      {/* Code Header */}
      <div className="border-border/60 bg-muted/30 flex items-center justify-between border-b px-4 py-2.5 font-mono text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Code2 className="text-primary size-4 shrink-0" />
          <span className="text-foreground truncate font-semibold">{artifact.title}</span>
          {artifact.filePath && (
            <span className="text-muted-foreground hidden truncate text-[11px] sm:inline">
              {artifact.filePath}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px] uppercase">
            {language} · {lines.length} lines
          </Badge>

          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1 px-2 text-xs">
            {copied ? <Check className="text-primary size-3" /> : <Copy className="size-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      {/* Code Body */}
      <div className="bg-background/60 text-foreground overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <pre className="whitespace-pre-wrap">{artifact.content}</pre>
      </div>
    </div>
  );
}
