/**
 * @file error-state.tsx
 * @description Generic dynamic Error component following reference design typography.
 * @module apps/console/components/ui
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UI_COPY } from "@/lib/ui-copy";

export interface DynamicErrorStateProps {
  /** Error instance or payload */
  error: Error | unknown;
  /** Reset / retry callback */
  reset?: () => void;
  /** Custom headline */
  title?: string;
  /** Custom descriptive message */
  description?: string;
  /** Error boundary label context */
  boundaryName?: string;
  /** Custom error reporting handler hook */
  onError?: (error: Error | unknown, context?: Record<string, unknown>) => void;
  /** Additional container classes */
  className?: string;
}

/**
 * Universal Dynamic Error Component matching reference typography and button layout.
 */
export function DynamicErrorState({
  error,
  reset,
  title = UI_COPY.COMMON.ERROR.DEFAULT_TITLE,
  description = UI_COPY.COMMON.ERROR.DEFAULT_DESCRIPTION,
  boundaryName = UI_COPY.COMMON.ERROR.DEFAULT_BOUNDARY,
  onError,
  className,
}: DynamicErrorStateProps): React.JSX.Element {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error context to client console
    // eslint-disable-next-line no-console
    console.error(`[${boundaryName}]`, error);
    if (onError) {
      onError(error, { boundary: boundaryName });
    }
  }, [error, boundaryName, onError]);

  const errorMessage =
    error instanceof Error ? error.message : String(error || UI_COPY.COMMON.ERROR.UNKNOWN_ERROR);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div
      className={cn(
        "bg-background flex size-full h-screen flex-col items-center justify-center p-6 text-center",
        className,
      )}
    >
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {reset && (
            <button
              onClick={reset}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors"
            >
              {UI_COPY.COMMON.ERROR.TRY_AGAIN}
            </button>
          )}

          <Link
            href="/"
            className="border-input bg-background text-foreground hover:bg-accent inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-xs transition-colors"
          >
            {UI_COPY.COMMON.ERROR.GO_HOME}
          </Link>

          <button
            onClick={() => setShowDetails((prev) => !prev)}
            className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-xs transition-colors"
          >
            {showDetails ? UI_COPY.COMMON.ERROR.HIDE_DETAILS : UI_COPY.COMMON.ERROR.DETAILS}
          </button>
        </div>

        {showDetails && (
          <div className="border-border bg-muted/40 mt-6 rounded-md border p-4 text-left font-mono text-xs shadow-inner">
            <p className="text-destructive font-semibold wrap-break-word">{errorMessage}</p>
            {errorStack && (
              <pre className="text-muted-foreground mt-2 max-h-40 overflow-x-auto text-[11px] whitespace-pre-wrap">
                {errorStack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
