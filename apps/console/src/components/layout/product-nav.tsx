"use client";

/**
 * @file product-nav.tsx
 * @description High-density vertical navigation rail component.
 * @module apps/console/components/layout
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./product-nav-items";

export { NAV_ITEMS };

/**
 * High-density vertical 56px navigation rail.
 * Displays brand symbol, icon tooltips, and active indicator.
 */
export function ProductNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={150}>
      <nav
        className="border-border bg-sidebar hidden w-14 shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r py-3 md:flex"
        aria-label="Product navigation"
      >
        {/* Brand Monogram */}
        <Link
          href="/"
          className="bg-primary text-primary-foreground mb-3 grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-sm font-bold shadow-sm"
          aria-label="OrchestrAI home"
        >
          O
        </Link>

        {/* Navigation Items */}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  aria-label={label}
                  className={cn(
                    "text-muted-foreground hover:bg-accent hover:text-foreground grid size-9 shrink-0 cursor-pointer place-items-center rounded-md transition-colors",
                    isActive && "bg-secondary text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-mono text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* User Profile / Settings Avatar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              aria-label="Settings"
              className={cn(
                "bg-secondary text-muted-foreground hover:text-foreground mt-auto grid size-9 shrink-0 cursor-pointer place-items-center rounded-md font-mono text-[10px]",
                pathname.startsWith("/settings") && "border-primary/40 text-primary border",
              )}
            >
              YP
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs">
            Settings & Profile
          </TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}
