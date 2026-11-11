/**
 * @file apps/console/src/components/ui/skeleton.tsx
 * @description Accessible, animated shimmer skeleton primitives and precomposed layout skeletons.
 * Replaces static "Loading..." text with layout-preserving placeholders.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
 */

import React from "react";
import { cn } from "../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional custom class styling */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base shimmer block for building custom loading skeletons.
 */
export function Skeleton({ className, style, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div className={cn("orch-skeleton", className)} style={style} aria-hidden="true" {...props} />
  );
}

/**
 * Precomposed skeleton for entity detail pages (agents, executions).
 * Left column has 2 large cards; right column has metadata sidebar.
 */
export function DetailPageSkeleton(): React.JSX.Element {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
      }}
      aria-hidden="true"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div className="orch-skeleton-card">
          <Skeleton style={{ height: "1.25rem", width: "12rem" }} />
          <Skeleton style={{ height: "4rem", width: "100%" }} />
        </div>
        <div className="orch-skeleton-card">
          <Skeleton style={{ height: "1.25rem", width: "10rem" }} />
          <Skeleton style={{ height: "6rem", width: "100%" }} />
        </div>
      </div>
      <div>
        <div className="orch-skeleton-card">
          <Skeleton style={{ height: "1.25rem", width: "8rem" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Precomposed skeleton for card grids (agents catalog, models catalog).
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }): React.JSX.Element {
  return (
    <div className="orch-skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="orch-skeleton-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Skeleton
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "var(--radius-md, 0.375rem)",
              }}
            />
            <div
              style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", gap: "0.375rem" }}
            >
              <Skeleton style={{ height: "1rem", width: "8rem" }} />
              <Skeleton style={{ height: "0.75rem", width: "5rem" }} />
            </div>
          </div>
          <Skeleton style={{ height: "3rem", width: "100%" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "0.5rem",
            }}
          >
            <Skeleton style={{ height: "1rem", width: "4rem" }} />
            <Skeleton style={{ height: "1rem", width: "5rem" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Precomposed skeleton for table rows (documents, traces, executions list).
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }): React.JSX.Element {
  return (
    <div className="orch-skeleton-card" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.5rem 0",
            borderBottom: i < rows - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <Skeleton style={{ height: "1rem", width: "12rem" }} />
          <Skeleton style={{ height: "1rem", width: "6rem" }} />
          <Skeleton style={{ height: "1rem", width: "4rem" }} />
        </div>
      ))}
    </div>
  );
}
