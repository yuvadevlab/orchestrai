"use client";

/**
 * @file apps/console/src/features/studio/components/canvas/canvas-preview-view.tsx
 * @description Sandboxed HTML/React Preview pane rendering dynamic code inside an isolated iframe.
 * @module apps/console/features/studio/components/canvas
 */

import React, { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

export interface CanvasPreviewViewProps {
  htmlContent: string;
  title?: string;
}

export function CanvasPreviewView({
  htmlContent,
  title = "HTML Sandbox Preview",
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
    <div className="bg-card text-foreground flex h-full flex-col overflow-hidden">
      {/* Sandbox Navigation Bar */}
      <div className="border-border/40 bg-muted/40 text-muted-foreground flex items-center justify-between border-b px-4 py-2 text-xs">
        <span className="text-foreground font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload Preview"
            className="hover:bg-muted rounded p-1 transition-colors"
          >
            <RefreshCw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const win = window.open();
              win?.document.write(fullHtml);
            }}
            title="Open in new window"
            className="hover:bg-muted rounded p-1 transition-colors"
          >
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Sandboxed iframe */}
      <iframe
        key={reloadKey}
        srcDoc={fullHtml}
        title={title}
        sandbox="allow-scripts"
        className="size-full flex-1 border-0"
      />
    </div>
  );
}
