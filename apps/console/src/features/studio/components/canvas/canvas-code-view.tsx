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
    <div className="bg-card text-foreground flex h-full flex-col overflow-hidden font-mono text-sm">
      {/* Code Action Bar */}
      <div className="border-border/40 bg-muted/40 flex items-center justify-between border-b px-4 py-2 text-xs">
        <span className="text-muted-foreground font-semibold tracking-wider uppercase">
          {language}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded border px-2.5 py-1 transition-colors"
        >
          {copied ? <Check className="text-primary size-3.5" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex flex-1 overflow-auto p-4">
        {/* Line Numbers Column */}
        <div aria-hidden className="text-muted-foreground/50 pr-4 text-right select-none">
          {lines.map((_, i) => (
            <div key={`line-${i + 1}`} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content / Textarea */}
        {readOnly ? (
          <pre className="text-foreground/90 flex-1 font-mono leading-6 whitespace-pre">
            <code>{code}</code>
          </pre>
        ) : (
          <textarea
            value={code}
            onChange={(e) => onChange?.(e.target.value)}
            spellCheck={false}
            className="text-foreground flex-1 resize-none bg-transparent leading-6 outline-none focus:ring-0"
          />
        )}
      </div>
    </div>
  );
}
