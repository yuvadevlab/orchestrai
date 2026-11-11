/**
 * @file error-state.tsx
 * @description Generic dynamic Error component following reference design typography.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
 */

"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { COMMON_COPY } from "../copy/common";

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
  title = COMMON_COPY.ERROR.DEFAULT_TITLE,
  description = COMMON_COPY.ERROR.DEFAULT_DESCRIPTION,
  boundaryName = COMMON_COPY.ERROR.DEFAULT_BOUNDARY,
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
    error instanceof Error ? error.message : String(error || COMMON_COPY.ERROR.UNKNOWN_ERROR);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md, 0.375rem)",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 150ms ease",
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    textDecoration: "none",
  };

  return (
    <div className={cn("orch-state-page", className)}>
      <div className="orch-state-page__inner">
        <h1 className="orch-state-page__title">{title}</h1>
        <p className="orch-state-page__desc">{description}</p>

        <div className="orch-state-page__actions">
          {reset && (
            <button
              onClick={reset}
              style={{
                ...btnStyle,
                backgroundColor: "var(--primary)",
                color: "var(--primaryForeground)",
                borderColor: "var(--primary)",
              }}
            >
              {COMMON_COPY.ERROR.TRY_AGAIN}
            </button>
          )}

          <a href="/" style={btnStyle}>
            {COMMON_COPY.ERROR.GO_HOME}
          </a>

          <button onClick={() => setShowDetails((prev) => !prev)} style={btnStyle}>
            {showDetails ? COMMON_COPY.ERROR.HIDE_DETAILS : COMMON_COPY.ERROR.DETAILS}
          </button>
        </div>

        {showDetails && (
          <div
            style={{
              marginTop: "1.5rem",
              borderRadius: "var(--radius-md, 0.375rem)",
              border: "1px solid var(--border)",
              backgroundColor: "color-mix(in oklab, var(--muted) 40%, transparent)",
              padding: "1rem",
              textAlign: "left",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
            }}
          >
            <p
              style={{
                color: "var(--destructive)",
                fontWeight: 600,
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {errorMessage}
            </p>
            {errorStack && (
              <pre
                style={{
                  color: "var(--mutedForeground)",
                  marginTop: "0.5rem",
                  maxHeight: "10rem",
                  overflowX: "auto",
                  fontSize: "0.6875rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {errorStack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
