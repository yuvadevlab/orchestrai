"use client";

/**
 * @file product-nav.tsx
 * @description High-density vertical navigation rail dynamically populated from database API.
 * @module apps/console/components/layout
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@yuva-devlab/ui";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useNavItems } from "@/lib/use-nav";
import { getNavIcon } from "@/lib/nav-icon-mapper";
import { ThemeToggle } from "./theme-toggle";

/**
 * High-density vertical 56px navigation rail.
 * Displays brand symbol, dynamic API-backed nav items, active indicator, theme toggle, and sign-out action.
 */
export function ProductNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userInitials = getInitials(user?.name || user?.email, "OP");
  const { data: navItems = [] } = useNavItems();

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
          aria-label="OrchestrAI Cowork home"
        >
          O
        </Link>

        {/* Dynamic Database Navigation Items */}
        {navItems.map((item) => {
          const Icon = getNavIcon(item.icon);
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/session")
              : pathname.startsWith(item.href);

          return (
            <Tooltip key={item.navItemId || item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "text-muted-foreground hover:bg-accent hover:text-foreground relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-md transition-all duration-200",
                    isActive && "bg-sidebar-accent text-primary",
                  )}
                >
                  <Icon className="size-4.5" />
                  {isActive && (
                    <span className="bg-primary absolute -left-2 h-5 w-1 rounded-r-full" />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-mono text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Bottom Actions: Theme Toggle, User Avatar, Sign Out */}
        <div className="mt-auto flex flex-col items-center gap-1 pt-3">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          {/* User Profile Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                aria-label="Settings & Profile"
                className={cn(
                  "bg-secondary text-muted-foreground hover:text-foreground grid size-9 shrink-0 cursor-pointer place-items-center rounded-md font-mono text-[10px]",
                  pathname.startsWith("/settings") && "border-primary/40 text-primary border",
                )}
              >
                {userInitials}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-xs">
              {user?.email || "Settings & Profile"}
            </TooltipContent>
          </Tooltip>

          {/* Sign Out Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 grid size-9 shrink-0 cursor-pointer place-items-center rounded-md transition-colors"
              >
                <LogOut className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-xs">
              Sign Out
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
