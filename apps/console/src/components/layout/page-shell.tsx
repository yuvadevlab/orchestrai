/**
 * @file page-shell.tsx
 * @description Standard page container for all Console routes.
 *
 * Composes `PageHeader` for the shared header row and wraps page content
 * in a scrollable `<main>` region. All routes that use `PageShell` get the
 * same header/content split without duplicating layout logic.
 *
 * @module apps/console/components/layout
 */

import React from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import type { BreadcrumbSegment } from "./page-header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Props accepted by the `PageShell` layout wrapper.
 *
 * All header customisations are forwarded to `PageHeader` internally.
 */
export interface PageShellProps {
  /** Primary page heading (maps to PageHeader `heading`). */
  title: string;

  /**
   * Optional single breadcrumb label appended after "OrchestrAI".
   * Provide a full `breadcrumbs` array instead when you need custom hrefs
   * or more than two levels of depth.
   */
  breadcrumb?: string;

  /**
   * Fully custom breadcrumb trail.
   * When provided, takes precedence over the `breadcrumb` shorthand.
   */
  breadcrumbs?: BreadcrumbSegment[];

  /**
   * Right-side slot for the header Row 1.
   * Accepts stats chips, action buttons, badge pills, or any ReactNode.
   * `stats` (plain string) and `actions` (buttons) are merged here and
   * rendered together so callers can still pass them separately.
   */
  stats?: React.ReactNode;
  /** Action buttons or icon controls rendered in the right header slot. */
  actions?: React.ReactNode;

  /**
   * Optional muted description rendered below the `<h1>`.
   * Maps directly to PageHeader `subHeading`.
   */
  description?: string;

  /** Page body content rendered inside the scrollable `<main>` region. */
  children: React.ReactNode;

  /** Extra className applied to the `<main>` element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Standard page container shared by every Console route.
 *
 * Renders:
 *   • `PageHeader` — breadcrumb, title, right-side stats/actions, description
 *   • `<main>` — scrollable content viewport
 *
 * @example
 * ```tsx
 * <PageShell
 *   title="Agents"
 *   breadcrumb="Agents"
 *   stats="12 registered"
 *   actions={<Button size="sm">Register Agent</Button>}
 *   description="Live agent definitions in the local cluster."
 * >
 *   <AgentGrid />
 * </PageShell>
 * ```
 */
export function PageShell({
  title,
  breadcrumb,
  breadcrumbs: breadcrumbsProp,
  stats,
  actions,
  description,
  children,
  className,
}: PageShellProps): React.JSX.Element {
  /**
   * Resolve the breadcrumb trail.
   * Priority: explicit `breadcrumbs` array > shorthand `breadcrumb` string.
   */
  const resolvedBreadcrumbs: BreadcrumbSegment[] = breadcrumbsProp
    ? breadcrumbsProp
    : [{ label: "OrchestrAI", href: "/" }, ...(breadcrumb ? [{ label: breadcrumb }] : [])];

  /**
   * Merge `stats` and `actions` into a single right-side ReactNode.
   * Both are optional; rendering is skipped when neither is provided.
   */
  const rightContent =
    stats || actions ? (
      <>
        {stats ? <span className="text-muted-foreground font-mono text-xs">{stats}</span> : null}
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </>
    ) : undefined;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Shared header — breadcrumb, h1, right-side stats/actions, description */}
      <PageHeader
        breadcrumbs={resolvedBreadcrumbs}
        heading={title}
        subHeading={description}
        rightContent={rightContent}
      />

      {/* Main Viewport — scrollable page content */}
      <main className={cn("min-h-0 flex-1 overflow-y-auto p-6", className)}>{children}</main>
    </div>
  );
}
