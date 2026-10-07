/**
 * @file apps/console/src/components/ui/skeleton.tsx
 * @description Accessible, animated shimmer skeleton primitives and precomposed layout skeletons.
 * Replaces static "Loading..." text with layout-preserving placeholders.
 * @module apps/console/components/ui
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional custom class styling */
  className?: string;
}

/**
 * Base shimmer block for building custom loading skeletons.
 */
export function Skeleton({ className, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn("bg-muted/60 animate-pulse rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Precomposed skeleton for entity detail pages (agents, executions).
 * Left column has 2 large cards; right column has metadata sidebar.
 */
export function DetailPageSkeleton(): React.JSX.Element {
  return (
    <div className="grid gap-3 lg:grid-cols-3" aria-hidden="true">
      <div className="space-y-3 lg:col-span-2">
        <div className="border-border bg-card/60 space-y-3 rounded-md border p-4 backdrop-blur">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="border-border bg-card/60 space-y-3 rounded-md border p-4 backdrop-blur">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="border-border bg-card/60 space-y-3 rounded-md border p-4 backdrop-blur">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card/60 space-y-3 rounded-md border p-4 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
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
    <div className="border-border bg-card/40 space-y-2 rounded-md border p-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-border/50 flex items-center justify-between gap-4 border-b py-2 last:border-0"
        >
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
