/**
 * @file page-header.tsx
 * @description Generic, multi-row page header used across all Console routes.
 *
 * Layout contract:
 *   Row 1 (always rendered):
 *     Left  → breadcrumb trail + h1 heading + optional muted sub-heading
 *     Right → arbitrary ReactNode: stats, action buttons, status pills, metrics
 *
 *   Row 2…N (optional, driven by `extraRows` array):
 *     Each element is rendered as its own row below Row 1.
 *     Row 2 is the command/prompt input for the Console page.
 *     Future rows (filter bars, tabs, etc.) are just more array entries.
 *
 * Why `extraRows` instead of named `row2` / `row3` props?
 *   Open-closed principle — callers add rows without changing this component's
 *   interface or needing a new prop per feature.
 *
 * @module apps/console/components/layout
 */

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@orchestrai/ui";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Represents a single crumb in the breadcrumb trail.
 * If `href` is omitted the crumb is treated as the current page (no link).
 */
export interface BreadcrumbSegment {
  /** Human-readable label rendered in the breadcrumb. */
  label: string;
  /** Navigation target. Omit for the active / current-page crumb. */
  href?: string;
}

/**
 * Props for the generic PageHeader component.
 *
 * All layout slots are optional except `heading` (required for semantic h1).
 * Pass `headingClassName="sr-only"` when the heading should be screen-reader-only
 * (e.g. Console page, where the breadcrumb trail is the visible label).
 */
export interface PageHeaderProps {
  /**
   * Ordered breadcrumb trail.
   * The last segment without an `href` becomes the active `<BreadcrumbPage>`.
   */
  breadcrumbs?: BreadcrumbSegment[];

  /**
   * Primary page heading rendered as an `<h1>`.
   * Semantically required on every page; visually hide with `headingClassName="sr-only"`.
   */
  heading: string;

  /**
   * Optional className applied to the `<h1>` element.
   * Use `"sr-only"` to keep the heading accessible but invisible.
   */
  headingClassName?: string;

  /**
   * Optional muted sub-heading rendered directly below the `<h1>`.
   * Suitable for short descriptions or status summaries.
   */
  subHeading?: string;

  /**
   * Right-side slot for Row 1.
   * Accepts any ReactNode: stat chips, icon buttons, badge pills, metric spans.
   */
  rightContent?: React.ReactNode;

  /**
   * Optional additional rows rendered below Row 1, each separated by `mt-2.5`.
   *
   * Index 0 → Row 2 (e.g. prompt input box on the Console page)
   * Index 1 → Row 3 (e.g. filter bar)
   * …and so on indefinitely without changing this component's API.
   */
  extraRows?: React.ReactNode[];

  /** Additional className merged onto the outer `<header>` element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Generic page-level header used by every Console route.
 *
 * Composes into a `<header>` with:
 *   • Row 1: breadcrumb + heading + right-side slot
 *   • Row N: each entry of `extraRows` as its own row
 *
 * @example — Standard page
 * ```tsx
 * <PageHeader
 *   breadcrumbs={[{ label: "OrchestrAI", href: "/" }, { label: "Agents" }]}
 *   heading="Agents"
 *   subHeading="Registered agent definitions"
 *   rightContent={<Button size="sm">Register</Button>}
 * />
 * ```
 *
 * @example — Console page with prompt input row
 * ```tsx
 * <PageHeader
 *   breadcrumbs={[{ label: "OrchestrAI", href: "/" }, { label: "Console" }]}
 *   heading="Console"
 *   headingClassName="sr-only"
 *   rightContent={<StatusPill running={running} />}
 *   extraRows={[<CommandInputRow onSubmit={onSubmit} />]}
 * />
 * ```
 */
export function PageHeader({
  breadcrumbs,
  heading,
  headingClassName,
  subHeading,
  rightContent,
  extraRows,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className={cn("orch-header", className)}>
      {/* ── Row 1: Left meta + Right slot ─────────────────────────────── */}
      <div className="orch-header__row1">
        {/* Left: breadcrumb trail → h1 heading → optional sub-heading */}
        <div className="orch-header__left">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList className="orch-header__breadcrumbs">
                {breadcrumbs.map((crumb, index) => {
                  /** Determine whether this is the last (active) segment. */
                  const isLast = index === breadcrumbs.length - 1;
                  /** Only render a separator before crumbs after the first. */
                  const needsSeparator = index > 0;

                  return (
                    <React.Fragment key={`${crumb.label}-${index}`}>
                      {/* Separator sits before every crumb except the first */}
                      {needsSeparator && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {/* Last crumb with no href → active page (no link) */}
                        {isLast && !crumb.href ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href ?? "#"}>{crumb.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {/* Primary semantic heading — always rendered, optionally hidden.
              text-gradient matches the Lovable PageHeader heading style. */}
          <h1 className={cn("orch-header__title text-gradient", headingClassName)}>{heading}</h1>

          {/* Optional muted sub-heading */}
          {subHeading ? <p className="orch-header__subtitle">{subHeading}</p> : null}
        </div>

        {/* Right: stats, actions, metrics — fully generic ReactNode slot */}
        {rightContent ? <div className="orch-header__right">{rightContent}</div> : null}
      </div>

      {/* ── Extra Rows (Row 2, 3, …) ───────────────────────────────────── */}
      {extraRows && extraRows.length > 0
        ? extraRows.map((row, index) =>
            row ? (
              <div key={index} className="orch-header__extra-row">
                {row}
              </div>
            ) : null,
          )
        : null}
    </header>
  );
}
