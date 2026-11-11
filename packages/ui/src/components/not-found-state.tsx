/**
 * @file not-found-state.tsx
 * @description Generic 404 Not Found component matching reference design layout & typography.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
 */

"use client";

import React from "react";
import { cn } from "../lib/utils";
import { COMMON_COPY } from "../copy/common";

export interface NotFoundStateProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Home link path */
  homeHref?: string;
  /** Additional styling */
  className?: string;
}

/**
 * Universal 404 Not Found component matching reference typography and button layout.
 */
export function NotFoundState({
  title = COMMON_COPY.NOT_FOUND.DEFAULT_TITLE,
  description = COMMON_COPY.NOT_FOUND.DEFAULT_DESCRIPTION,
  homeHref = COMMON_COPY.NOT_FOUND.HOME_HREF,
  className,
}: NotFoundStateProps): React.JSX.Element {
  return (
    <div className={cn("orch-state-page", className)}>
      <div className="orch-state-page__inner">
        <h1 className="orch-state-page__code">{COMMON_COPY.NOT_FOUND.CODE}</h1>
        <h2 className="orch-state-page__title">{title}</h2>
        <p className="orch-state-page__desc">{description}</p>
        <div className="orch-state-page__actions">
          <a
            href={homeHref}
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primaryForeground)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-md, 0.375rem)",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "opacity 150ms ease",
            }}
          >
            {COMMON_COPY.NOT_FOUND.GO_HOME}
          </a>
        </div>
      </div>
    </div>
  );
}
