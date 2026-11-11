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
function Shimmer({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}): React.JSX.Element {
  return <div className={`orch-shimmer ${className ?? ""}`} style={style} aria-hidden="true" />;
}

/**
 * Skeleton that mirrors the PageShell header layout:
 * left column (breadcrumb + heading + sub-heading) and right column (action area).
 */
function HeaderSkeleton(): React.JSX.Element {
  return (
    <header className="orch-loading-header">
      <div className="orch-loading-header__inner">
        <div className="orch-loading-header__meta">
          {/* Breadcrumb line */}
          <Shimmer style={{ height: "0.75rem", width: "10rem" }} />
          {/* Page heading */}
          <Shimmer style={{ height: "1.25rem", width: "14rem" }} />
        </div>
        {/* Right-side action area */}
        <Shimmer style={{ height: "2rem", width: "6rem" }} />
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
    <div style={{ padding: "1.5rem" }}>
      <div className="orch-loading-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="orch-loading-card" aria-hidden="true">
            <div className="orch-loading-card__header">
              <Shimmer style={{ width: "2rem", height: "2rem" }} />
              <div className="orch-loading-card__meta">
                <Shimmer style={{ height: "0.875rem", width: "75%" }} />
                <Shimmer style={{ height: "0.75rem", width: "50%" }} />
              </div>
            </div>
            <Shimmer style={{ height: "0.75rem", width: "100%" }} />
            <Shimmer style={{ height: "0.75rem", width: "80%" }} />
            <Shimmer style={{ height: "0.75rem", width: "65%" }} />
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
    <div className="orch-page-shell">
      <HeaderSkeleton />
      <main className="orch-page-shell__main" style={{ padding: 0 }}>
        <ContentSkeleton />
      </main>
    </div>
  );
}
