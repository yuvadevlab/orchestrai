"use client";

/**
 * @file studio-thinking-block.tsx
 * @description Collapsible reasoning and planning block with duration timer.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

export interface StudioThinkingBlockProps {
  text: string;
  durationSeconds?: number;
  initiallyCollapsed?: boolean;
}

/**
 * Expandable chain-of-thought reasoning drawer.
 */
export function StudioThinkingBlock({
  text,
  durationSeconds = 1.4,
  initiallyCollapsed = true,
}: StudioThinkingBlockProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(!initiallyCollapsed);

  if (!text) return <></>;

  return (
    <div className="border-border/60 bg-muted/20 my-2 overflow-hidden rounded-md border">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-3 py-2 text-left font-mono text-xs transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-3.5 animate-pulse" />
          <span className="font-medium">Thinking Process</span>
          <span className="text-muted-foreground/60 text-[10px]">
            ({durationSeconds.toFixed(1)}s)
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <span>{isOpen ? "Hide" : "Show"}</span>
          {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-border/40 text-muted-foreground bg-card/30 border-t px-3.5 py-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
}
