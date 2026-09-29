"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-diff-view.tsx
 * @description Visual side-by-side Diff Viewer comparing original and modified artifact code using theme tokens.
 * @module apps/console/features/studio/components/canvas
 */

import React from "react";

export interface CanvasDiffViewProps {
  originalText?: string;
  modifiedText?: string;
}

export function CanvasDiffView({
  originalText = "",
  modifiedText = "",
}: CanvasDiffViewProps): React.JSX.Element {
  const originalLines = originalText.split("\n");
  const modifiedLines = modifiedText.split("\n");
  const maxLines = Math.max(originalLines.length, modifiedLines.length);

  return (
    <div className="bg-card text-foreground flex h-full flex-col overflow-hidden font-mono text-xs">
      {/* Diff Header */}
      <div className="border-border/40 bg-muted/40 grid grid-cols-2 border-b px-4 py-2">
        <span className="text-destructive font-semibold">Original (Previous)</span>
        <span className="text-primary font-semibold">Modified (Current)</span>
      </div>

      {/* Side-by-Side Diff Content */}
      <div className="flex-1 overflow-auto p-2">
        <div className="divide-border/40 grid grid-cols-2 gap-x-2 divide-x">
          {/* Left Column: Original */}
          <div className="space-y-0.5">
            {Array.from({ length: maxLines }).map((_, idx) => {
              const line = originalLines[idx];
              const modLine = modifiedLines[idx];
              const isDiff = line !== modLine;

              return (
                <div
                  key={`orig-${idx}`}
                  className={`flex leading-5 ${
                    isDiff && line !== undefined
                      ? "bg-destructive/10 text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/50 w-8 shrink-0 pr-2 text-right select-none">
                    {idx < originalLines.length ? idx + 1 : ""}
                  </span>
                  <span className="truncate whitespace-pre">{line ?? ""}</span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Modified */}
          <div className="space-y-0.5 pl-2">
            {Array.from({ length: maxLines }).map((_, idx) => {
              const line = modifiedLines[idx];
              const origLine = originalLines[idx];
              const isDiff = line !== origLine;

              return (
                <div
                  key={`mod-${idx}`}
                  className={`flex leading-5 ${
                    isDiff && line !== undefined ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/50 w-8 shrink-0 pr-2 text-right select-none">
                    {idx < modifiedLines.length ? idx + 1 : ""}
                  </span>
                  <span className="truncate whitespace-pre">{line ?? ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
