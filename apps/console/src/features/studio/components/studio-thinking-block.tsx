"use client";

/**
 * @file studio-thinking-block.tsx
 * @description Collapsible reasoning and planning block with duration timer.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

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
    <div className="orch-thinking-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="orch-thinking-header"
      >
        <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <Sparkles
            className="orch-text-primary"
            style={{ width: "0.875rem", height: "0.875rem" }}
          />
          <span className="orch-font-medium">{UI_COPY.STUDIO.THINKING.TITLE}</span>
          <span className="orch-text-muted" style={{ fontSize: "0.625rem", opacity: 0.6 }}>
            ({durationSeconds.toFixed(1)}s)
          </span>
        </div>

        <div
          className="orch-flex-row orch-gap-xs"
          style={{ alignItems: "center", fontSize: "0.6875rem" }}
        >
          <span>{isOpen ? UI_COPY.STUDIO.THINKING.HIDE : UI_COPY.STUDIO.THINKING.SHOW}</span>
          {isOpen ? (
            <ChevronDown style={{ width: "0.875rem", height: "0.875rem" }} />
          ) : (
            <ChevronRight style={{ width: "0.875rem", height: "0.875rem" }} />
          )}
        </div>
      </button>

      {isOpen && <div className="orch-thinking-body">{text}</div>}
    </div>
  );
}
