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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@orchestrai/ui";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useNavItems } from "@/lib/hooks";
import { getNavIcon } from "@/lib/navigation";
import { UI_COPY } from "@/lib/ui-copy";
import { ThemeToggle } from "./theme-toggle";

/**
 * High-density vertical 56px navigation rail.
 * Displays brand symbol, dynamic API-backed nav items, active indicator, theme toggle, and sign-out action.
 */
export function ProductNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userInitials = getInitials(
    user?.name || user?.email,
    UI_COPY.COMMON.BRAND.DEFAULT_INITIALS,
  );
  const { data: navItems = [] } = useNavItems();

  return (
    <TooltipProvider delayDuration={150}>
      <nav className="orch-nav-rail" aria-label={UI_COPY.COMMON.A11Y.PRODUCT_NAV}>
        {/* Brand Monogram */}
        <Link href="/" className="orch-nav-rail__brand" aria-label={UI_COPY.COMMON.A11Y.HOME}>
          {UI_COPY.COMMON.BRAND.MONOGRAM}
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
                  className={cn("orch-nav-rail__item", isActive && "orch-nav-rail__item--active")}
                >
                  <Icon style={{ width: "1.125rem", height: "1.125rem" }} />
                  {isActive && <span className="orch-nav-rail__indicator" />}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}

        {/* Bottom Actions: Theme Toggle, User Avatar, Sign Out */}
        <div className="orch-nav-rail__footer">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          {/* User Profile Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                aria-label={UI_COPY.COMMON.A11Y.SETTINGS}
                className={cn(
                  "orch-nav-rail__avatar",
                  pathname.startsWith("/settings") && "orch-nav-rail__avatar--active",
                )}
              >
                {userInitials}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {user?.email || UI_COPY.COMMON.A11Y.SETTINGS}
            </TooltipContent>
          </Tooltip>

          {/* Sign Out Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={logout}
                aria-label={UI_COPY.COMMON.A11Y.SIGN_OUT}
                className="orch-nav-rail__btn orch-nav-rail__btn--signout"
              >
                <LogOut style={{ width: "1rem", height: "1rem" }} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{UI_COPY.COMMON.A11Y.SIGN_OUT_BTN}</TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
