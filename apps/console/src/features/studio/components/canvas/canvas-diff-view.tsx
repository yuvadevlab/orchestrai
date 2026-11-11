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
      result.unshift({ op: DiffOp.EQUAL, text: origLine ?? "", origLine: i, modLine: j });
      origCounter = i;
      modCounter = j;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (dp[idx(i, j - 1)] ?? 0) >= (dp[idx(i - 1, j)] ?? 0))) {
      result.unshift({ op: DiffOp.INSERT, text: modLine ?? "", modLine: j });
      modCounter = j;
      j--;
    } else {
      result.unshift({ op: DiffOp.DELETE, text: origLine ?? "", origLine: i });
      origCounter = i;
      i--;
    }
  }

  void origCounter;
  void modCounter;

  return result;
}

/**
 * Side-by-side diff viewer that correctly aligns ADDED/REMOVED/EQUAL blocks.
 */
export function CanvasDiffView({
  originalText = "",
  modifiedText = "",
}: CanvasDiffViewProps): React.JSX.Element {
  const originalLines = originalText.split("\n");
  const modifiedLines = modifiedText.split("\n");
  const diffLines = computeDiff(originalLines, modifiedLines);

  return (
    <div className="orch-diff-container">
      {/* Diff Header */}
      <div className="orch-diff-header">
        <span className="orch-text-destructive orch-font-semibold">
          {UI_COPY.STUDIO.CANVAS.DIFF_ORIGINAL}
        </span>
        <span className="orch-text-primary orch-font-semibold">
          {UI_COPY.STUDIO.CANVAS.DIFF_MODIFIED}
        </span>
      </div>

      {/* Side-by-Side Diff Content */}
      <div style={{ flex: "1 1 0%", overflow: "auto" }}>
        <div className="orch-diff-grid">
          {/* Left Column: Original */}
          <div>
            {diffLines.map((line, idx) => {
              if (line.op === DiffOp.INSERT) {
                return (
                  <div key={`orig-${idx}`} style={{ height: "1.25rem", opacity: 0 }}>
                    <span style={{ width: "2rem", display: "inline-block" }} />
                  </div>
                );
              }
              const isDel = line.op === DiffOp.DELETE;
              return (
                <div
                  key={`orig-${idx}`}
                  className={`orch-diff-line ${isDel ? "orch-diff-line--del" : "orch-text-muted"}`}
                >
                  <span
                    className="orch-text-muted"
                    style={{
                      width: "2rem",
                      flexShrink: 0,
                      paddingRight: "0.5rem",
                      textAlign: "right",
                      userSelect: "none",
                      opacity: 0.5,
                    }}
                  >
                    {line.origLine ?? ""}
                  </span>
                  <span
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "0 0.25rem",
                      whiteSpace: "pre",
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Modified */}
          <div>
            {diffLines.map((line, idx) => {
              if (line.op === DiffOp.DELETE) {
                return (
                  <div key={`mod-${idx}`} style={{ height: "1.25rem", opacity: 0 }}>
                    <span style={{ width: "2rem", display: "inline-block" }} />
                  </div>
                );
              }
              const isAdd = line.op === DiffOp.INSERT;
              return (
                <div
                  key={`mod-${idx}`}
                  className={`orch-diff-line ${isAdd ? "orch-diff-line--add" : ""}`}
                >
                  <span
                    className="orch-text-muted"
                    style={{
                      width: "2rem",
                      flexShrink: 0,
                      paddingRight: "0.5rem",
                      textAlign: "right",
                      userSelect: "none",
                      opacity: 0.5,
                    }}
                  >
                    {line.modLine ?? ""}
                  </span>
                  <span
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "0 0.25rem",
                      whiteSpace: "pre",
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
