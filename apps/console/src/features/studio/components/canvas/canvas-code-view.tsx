"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-code-view.tsx
 * @description Interactive Code Editor view for the Canvas pane using semantic theme tokens.
 * @module apps/console/features/studio/components/canvas
 */

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CanvasCodeViewProps {
  code: string;
  language?: string;
  onChange?: (newCode: string) => void;
  readOnly?: boolean;
}

export function CanvasCodeView({
  code,
  language = "typescript",
  onChange,
  readOnly = false,
}: CanvasCodeViewProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore clipboard restrictions
    }
  };

  const lines = code.split("\n");

  return (
    <div className="orch-diff-container" style={{ fontSize: "0.875rem" }}>
      {/* Code Action Bar */}
      <div className="orch-canvas-bar">
        <span
          className="orch-text-muted orch-font-semibold"
          style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          {language}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="orch-flex-row orch-gap-xs orch-text-muted"
          style={{
            alignItems: "center",
            borderRadius: "var(--radius-sm, 0.25rem)",
            border: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
            padding: "0.25rem 0.625rem",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          {copied ? (
            <Check
              className="orch-text-primary"
              style={{ width: "0.875rem", height: "0.875rem" }}
            />
          ) : (
            <Copy style={{ width: "0.875rem", height: "0.875rem" }} />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Editor Body with Line Numbers */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flex: "1 1 0%",
          overflow: "auto",
          padding: "1rem",
        }}
      >
        {/* Line Numbers Column */}
        <div
          aria-hidden
          className="orch-text-muted"
          style={{ paddingRight: "1rem", textAlign: "right", userSelect: "none", opacity: 0.5 }}
        >
          {lines.map((_, i) => (
            <div key={`line-${i + 1}`} style={{ lineHeight: "1.5rem" }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content / Textarea */}
        {readOnly ? (
          <pre
            style={{
              margin: 0,
              flex: 1,
              fontFamily: "var(--font-mono, monospace)",
              lineHeight: "1.5rem",
              whiteSpace: "pre",
            }}
          >
            <code>{code}</code>
          </pre>
        ) : (
          <textarea
            value={code}
            onChange={(e) => onChange?.(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              resize: "none",
              background: "transparent",
              lineHeight: "1.5rem",
              outline: "none",
              border: "none",
              color: "inherit",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          />
        )}
      </div>
    </div>
  );
}
