/**
 * @file loading.tsx
 * @description Route-level loading skeleton for all dashboard pages.
 *
 * Next.js App Router automatically wraps each page in a Suspense boundary and
 * shows this component while the page's JS chunk is downloading or while
 * server data is streaming. It replaces the need for per-page inline Suspense
 * fallbacks for navigation-triggered loading states.
 *
 * Layout intentionally mirrors PageShell (header bar + content area) so there
 * is no layout shift between loading and loaded states.
 *
 * @module apps/console/app/(dashboard)
 */

import React from "react";

/**
 * A single shimmer bar used to approximate a text or heading skeleton.
 */
function Shimmer({ className }: { className?: string }): React.JSX.Element {
  return (
    <div className={`bg-muted/60 animate-pulse rounded-md ${className ?? ""}`} aria-hidden="true" />
  );
}

/**
 * Skeleton that mirrors the PageShell header layout:
 * left column (breadcrumb + heading + sub-heading) and right column (action area).
 */
function HeaderSkeleton(): React.JSX.Element {
  return (
    <header className="border-border bg-background/95 shrink-0 border-b px-6 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          {/* Breadcrumb line */}
          <Shimmer className="h-3 w-40" />
          {/* Page heading */}
          <Shimmer className="h-5 w-56" />
        </div>
        {/* Right-side action area */}
        <Shimmer className="h-8 w-24 rounded-md" />
      </div>
    </header>
  );
}

/**
 * Content skeleton — a grid of muted placeholder cards approximating
 * the most common page layout (card grid or list).
 */
function ContentSkeleton(): React.JSX.Element {
  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card space-y-3 rounded-md border p-4"
            aria-hidden="true"
          >
            <div className="flex items-center gap-3">
              <Shimmer className="size-8 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-3.5 w-3/4" />
                <Shimmer className="h-3 w-1/2" />
              </div>
            </div>
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard route-level loading UI.
 * Shown automatically by Next.js during route transitions and initial chunk download.
 */
export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <HeaderSkeleton />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <ContentSkeleton />
      </main>
    </div>
  );
}
