"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-terminal-view.tsx
 * @description ANSI Terminal Output Emulator rendering real-time CLI logs using semantic theme tokens.
 * @module apps/console/features/studio/components/canvas
 */

import React, { useRef, useEffect } from "react";
import { Terminal, Trash2 } from "lucide-react";

export interface CanvasTerminalViewProps {
  logs?: readonly string[];
  command?: string;
  onClear?: () => void;
}

export function CanvasTerminalView({
  logs = [],
  command = "bash",
  onClear,
}: CanvasTerminalViewProps): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="bg-card text-foreground flex h-full flex-col overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="border-border/40 bg-muted/40 flex items-center justify-between border-b px-4 py-2">
        <div className="text-muted-foreground flex items-center gap-2">
          <Terminal className="text-primary size-3.5" />
          <span className="text-foreground font-semibold">{command}</span>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            title="Clear output"
            className="hover:text-foreground text-muted-foreground/60 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {/* Terminal Output Body */}
      <div className="flex-1 space-y-1 overflow-auto p-4">
        {logs.length === 0 ? (
          <div className="text-muted-foreground/60 italic">No command output available yet...</div>
        ) : (
          logs.map((line, idx) => (
            <div key={`log-${idx}`} className="leading-5 break-all whitespace-pre-wrap">
              <span className="text-muted-foreground/50 pr-2 select-none">$</span>
              <span>{line}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} aria-hidden />
      </div>
    </div>
  );
}
