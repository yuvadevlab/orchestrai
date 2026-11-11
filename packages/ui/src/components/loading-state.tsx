/**
 * @file loading-state.tsx
 * @description Generic Loading component following reference typography.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { COMMON_COPY } from "../copy/common";

export interface LoadingStateProps {
  /** Primary loading title */
  title?: string;
  /** Subtitle description */
  description?: string;
  /** Additional custom container styling */
  className?: string;
}

/**
 * Universal Loading State component matching reference typography.
 */
export function LoadingState({
  title = COMMON_COPY.LOADING.PAGE_TITLE,
  description = COMMON_COPY.LOADING.DESCRIPTION,
  className,
}: LoadingStateProps): React.JSX.Element {
  return (
    <div className={cn("orch-state-page", className)}>
      <div className="orch-state-page__inner">
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
          <Loader2
            style={{ width: "2rem", height: "2rem", color: "var(--primary)" }}
            className="orch-animate-spin"
          />
        </div>
        <h1 className="orch-state-page__title">{title}</h1>
        <p className="orch-state-page__desc">{description}</p>
      </div>
    </div>
  );
}
