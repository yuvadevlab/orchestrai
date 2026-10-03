"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-diff-view.tsx
 * @description Visual side-by-side Diff Viewer with proper LCS-based unified diff algorithm.
 * Lines are classified as ADDED, REMOVED, or UNCHANGED — never positionally mismatched.
 * @module apps/console/features/studio/components/canvas
 */

import React from "react";
import { UI_COPY } from "@/lib/ui-copy";

export interface CanvasDiffViewProps {
  originalText?: string;
  modifiedText?: string;
}

/** Diff operation categories for each text line. */
const enum DiffOp {
  EQUAL = "equal",
  INSERT = "insert",
  DELETE = "delete",
}

interface DiffLine {
  op: DiffOp;
  text: string;
  /** 1-based line number in the original file, undefined for inserted lines */
  origLine?: number;
  /** 1-based line number in the modified file, undefined for deleted lines */
  modLine?: number;
}

/**
 * Computes a longest-common-subsequence (LCS) diff between two string arrays.
 * Returns classified diff lines suitable for side-by-side rendering.
 *
 * @param original - Lines of the original (left) file
 * @param modified - Lines of the modified (right) file
 * @returns Ordered sequence of DiffLine records with op, text, and line numbers
 */
function computeDiff(original: string[], modified: string[]): DiffLine[] {
  const m = original.length;
  const n = modified.length;

  // Build LCS DP table (m+1) x (n+1)
  // Using a flat (m+1)*(n+1) Int32Array avoids TypeScript 2D-array undefined-index errors
  const dp = new Int32Array((m + 1) * (n + 1));
  const idx = (r: number, c: number): number => r * (n + 1) + c;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === modified[j - 1]) {
        dp[idx(i, j)] = (dp[idx(i - 1, j - 1)] ?? 0) + 1;
      } else {
        dp[idx(i, j)] = Math.max(dp[idx(i - 1, j)] ?? 0, dp[idx(i, j - 1)] ?? 0);
      }
    }
  }

  // Backtrack the DP table to build the diff sequence
  const result: DiffLine[] = [];
  let i = m;
  let j = n;
  let origCounter = m;
  let modCounter = n;

  while (i > 0 || j > 0) {
    const origLine = original[i - 1];
    const modLine = modified[j - 1];
    if (i > 0 && j > 0 && origLine === modLine) {
      // Lines are equal — no change
      result.unshift({ op: DiffOp.EQUAL, text: origLine ?? "", origLine: i, modLine: j });
      origCounter = i;
      modCounter = j;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (dp[idx(i, j - 1)] ?? 0) >= (dp[idx(i - 1, j)] ?? 0))) {
      // Line was inserted in modified
      result.unshift({ op: DiffOp.INSERT, text: modLine ?? "", modLine: j });
      modCounter = j;
      j--;
    } else {
      // Line was deleted from original
      result.unshift({ op: DiffOp.DELETE, text: origLine ?? "", origLine: i });
      origCounter = i;
      i--;
    }
  }

  // Suppress unused variable warnings — counters track final line numbers for future use
  void origCounter;
  void modCounter;

  return result;
}

/**
 * Side-by-side diff viewer that correctly aligns ADDED/REMOVED/EQUAL blocks
 * using a proper LCS algorithm. Deleted lines appear red on the left, inserted
 * lines appear green on the right, unchanged lines are dimmed on both sides.
 */
export function CanvasDiffView({
  originalText = "",
  modifiedText = "",
}: CanvasDiffViewProps): React.JSX.Element {
  const originalLines = originalText.split("\n");
  const modifiedLines = modifiedText.split("\n");
  const diffLines = computeDiff(originalLines, modifiedLines);

  return (
    <div className="bg-card text-foreground flex h-full flex-col overflow-hidden font-mono text-xs">
      {/* Diff Header */}
      <div className="border-border/40 bg-muted/40 grid grid-cols-2 border-b px-4 py-2">
        <span className="text-destructive font-semibold">
          {UI_COPY.STUDIO.CANVAS.DIFF_ORIGINAL}
        </span>
        <span className="text-primary font-semibold">{UI_COPY.STUDIO.CANVAS.DIFF_MODIFIED}</span>
      </div>

      {/* Side-by-Side Diff Content */}
      <div className="flex-1 overflow-auto">
        <div className="divide-border/40 grid min-w-0 grid-cols-2 divide-x">
          {/* Left Column: Original (EQUAL + DELETE) */}
          <div className="space-y-0">
            {diffLines.map((line, idx) => {
              if (line.op === DiffOp.INSERT) {
                // Right-only insert — show empty slot on the left to maintain alignment
                return (
                  <div key={`orig-${idx}`} className="bg-primary/5 flex h-5 leading-5 opacity-0">
                    <span className="w-8 shrink-0" />
                  </div>
                );
              }
              return (
                <div
                  key={`orig-${idx}`}
                  className={`flex leading-5 ${
                    line.op === DiffOp.DELETE
                      ? "bg-destructive/10 text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/50 w-8 shrink-0 pr-2 text-right select-none">
                    {line.origLine ?? ""}
                  </span>
                  <span className="min-w-0 truncate px-1 whitespace-pre">{line.text}</span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Modified (EQUAL + INSERT) */}
          <div className="space-y-0">
            {diffLines.map((line, idx) => {
              if (line.op === DiffOp.DELETE) {
                // Left-only delete — show empty slot on the right to maintain alignment
                return (
                  <div key={`mod-${idx}`} className="bg-destructive/5 flex h-5 leading-5 opacity-0">
                    <span className="w-8 shrink-0" />
                  </div>
                );
              }
              return (
                <div
                  key={`mod-${idx}`}
                  className={`flex leading-5 ${
                    line.op === DiffOp.INSERT ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/50 w-8 shrink-0 pr-2 text-right select-none">
                    {line.modLine ?? ""}
                  </span>
                  <span className="min-w-0 truncate px-1 whitespace-pre">{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
