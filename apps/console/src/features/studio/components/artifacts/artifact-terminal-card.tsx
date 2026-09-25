"use client";

/**
 * @file artifact-terminal-card.tsx
 * @description Terminal log window showing command, exit code, duration, and output stream.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { Check, CheckCircle2, Copy, Terminal } from "lucide-react";
import { Badge, Button } from "@yuva-devlab/ui";
import type { CoworkArtifact } from "../../types";

export interface ArtifactTerminalCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders a dark terminal execution box.
 */
export function ArtifactTerminalCard({ artifact }: ArtifactTerminalCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-border/80 my-3 overflow-hidden rounded-md border shadow-sm">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-100">{artifact.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary px-1.5 py-0 font-mono text-[10px]"
          >
            <CheckCircle2 className="mr-1 size-3" />
            exit 0
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="size-6 p-0 text-zinc-400 hover:text-zinc-100"
            title="Copy terminal output"
          >
            {copied ? <Check className="text-primary size-3" /> : <Copy className="size-3" />}
          </Button>
        </div>
      </div>

      {/* Terminal Console Output */}
      <div className="overflow-x-auto bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200">
        <div className="mb-2 flex items-center gap-1.5 text-zinc-500">
          <span className="text-amber-400">$</span>
          <span>{artifact.filePath || artifact.title}</span>
        </div>
        <pre className="whitespace-pre-wrap">{artifact.content}</pre>
      </div>
    </div>
  );
}
