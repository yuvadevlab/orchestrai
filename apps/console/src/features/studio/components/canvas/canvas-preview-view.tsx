"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-preview-view.tsx
 * @description Sandboxed HTML/React Preview pane rendering dynamic code inside an isolated iframe.
 * @module apps/console/features/studio/components/canvas
 */

import React, { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

export interface CanvasPreviewViewProps {
  htmlContent: string;
  title?: string;
}

export function CanvasPreviewView({
  htmlContent,
  title = UI_COPY.STUDIO.CANVAS.DEFAULT_PREVIEW_TITLE,
}: CanvasPreviewViewProps): React.JSX.Element {
  const [reloadKey, setReloadKey] = useState(0);

  // Wraps basic HTML or body snippets with standard boilerplate styling if raw
  const fullHtml = htmlContent.includes("<html")
    ? htmlContent
    : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 1.5rem;
      color: #18181b;
      background: #fafafa;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  return (
    <div className="orch-terminal-view">
      {/* Sandbox Navigation Bar */}
      <div className="orch-canvas-bar orch-text-muted">
        <span className="orch-font-medium" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
        <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title={UI_COPY.STUDIO.CANVAS.RELOAD_PREVIEW}
            aria-label={UI_COPY.STUDIO.CANVAS.RELOAD_PREVIEW}
            className="orch-text-muted"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <RefreshCw style={{ width: "0.875rem", height: "0.875rem" }} />
          </button>
          <button
            type="button"
            onClick={() => {
              const win = window.open();
              if (win) {
                win.document.documentElement.innerHTML = fullHtml;
              }
            }}
            title={UI_COPY.STUDIO.CANVAS.OPEN_NEW_WINDOW}
            aria-label={UI_COPY.STUDIO.CANVAS.OPEN_NEW_WINDOW}
            className="orch-text-muted"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
          </button>
        </div>
      </div>

      {/* Sandboxed iframe */}
      <iframe
        key={reloadKey}
        srcDoc={fullHtml}
        title={title}
        sandbox="allow-scripts"
        style={{ width: "100%", height: "100%", flex: 1, border: "none" }}
      />
    </div>
  );
}
