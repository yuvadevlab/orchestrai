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
import { Badge, Button } from "@yuva-devlab/ui";
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
    <div className="border-border/80 my-2 overflow-hidden rounded-md border shadow-sm">
      {/* Terminal Title Bar */}
      <div
        className={`flex items-center justify-between bg-zinc-900 px-3.5 py-2 font-mono text-xs text-zinc-300 ${
          isExpanded ? "border-b border-zinc-800" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-zinc-100"
        >
          <Terminal className="size-3.5 shrink-0 text-amber-400" />
          <span className="truncate font-semibold text-zinc-100">{artifact.title}</span>
          <span className="ml-1 flex items-center gap-0.5 text-[10px] text-zinc-400">
            <span>{isExpanded ? "Hide" : "Show"}</span>
            {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary px-1.5 py-0 font-mono text-[10px]"
          >
            <CheckCircle2 className="mr-1 size-3" />
            exit 0
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInCanvas}
            className="h-6 cursor-pointer gap-1 border-zinc-700 bg-zinc-800/80 px-2 text-[10px] text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
            title="Open in Right-Side Canvas"
          >
            <PanelRightOpen className="size-3 text-amber-400" />
            <span className="hidden sm:inline">Canvas</span>
          </Button>

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
      {isExpanded && (
        <div className="overflow-x-auto bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200">
          <div className="mb-2 flex items-center gap-1.5 text-zinc-500">
            <span className="text-amber-400">$</span>
            <span>{artifact.filePath || artifact.title}</span>
          </div>
          <pre className="whitespace-pre-wrap">{artifact.content}</pre>
        </div>
      )}
    </div>
  );
}
