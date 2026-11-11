"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-terminal-view.tsx
 * @description ANSI Terminal Output Emulator rendering real-time CLI logs using semantic theme tokens.
 * @module apps/console/features/studio/components/canvas
 */

import React, { useRef, useEffect } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

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
    <div className="orch-terminal-view">
      {/* Terminal Title Bar */}
      <div className="orch-canvas-bar">
        <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <Terminal
            className="orch-text-primary"
            style={{ width: "0.875rem", height: "0.875rem" }}
          />
          <span className="orch-font-semibold">{command}</span>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            title={UI_COPY.COMMON.A11Y.CLEAR_OUTPUT}
            aria-label={UI_COPY.COMMON.A11Y.CLEAR_OUTPUT}
            className="orch-text-muted"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.125rem",
            }}
          >
            <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
          </button>
        )}
      </div>

      {/* Terminal Output Body */}
      <div className="orch-terminal-body">
        {logs.length === 0 ? (
          <div className="orch-text-muted" style={{ fontStyle: "italic", opacity: 0.6 }}>
            {UI_COPY.STUDIO.CANVAS.TERMINAL_NO_OUTPUT}
          </div>
        ) : (
          logs.map((line, idx) => (
            <div
              key={`log-${idx}`}
              style={{ lineHeight: "1.25rem", wordBreak: "break-all", whiteSpace: "pre-wrap" }}
            >
              <span
                className="orch-text-muted"
                style={{ paddingRight: "0.5rem", userSelect: "none", opacity: 0.5 }}
              >
                $
              </span>
              <span>{line}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} aria-hidden />
      </div>
    </div>
  );
}
