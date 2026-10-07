"use client";

/**
 * @file sidebar-nav.tsx
 * @description Sidebar navigation component dynamically populated from database API.
 * @module apps/console/components/dashboard
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";
import { useNavItems, usePlatformBranding } from "@/lib/hooks";
import { getNavIcon } from "@/lib/navigation";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Sidebar Navigation component for OrchestrAI Console.
 * Displays brand identity and navigable route links loaded from the backend API.
 */
export function SidebarNav(): React.JSX.Element {
  const pathname = usePathname();
  const { data: navItems = [] } = useNavItems();
  const { data: branding } = usePlatformBranding();

  const brandName = branding?.brandName ?? UI_COPY.COMMON.BRAND.DEFAULT_NAME;
  const brandVersion = branding?.brandVersion ?? UI_COPY.COMMON.SIDEBAR.DEFAULT_BRAND_VERSION;

  return (
    <aside className="border-border bg-sidebar flex h-screen w-64 shrink-0 flex-col border-r">
      <div className="border-sidebar-border flex h-14 items-center gap-2.5 border-b px-4">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md font-bold shadow-sm">
          <Layers className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sidebar-foreground text-sm font-bold tracking-tight">
            {brandName}
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">{brandVersion}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.length === 0 ? (
          <div className="text-muted-foreground/60 px-3 py-4 text-xs italic">
            {UI_COPY.COMMON.SIDEBAR.NO_NAV_ITEMS}
          </div>
        ) : (
          navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = getNavIcon(item.icon);

            return (
              <Link
                key={item.navItemId || item.href}
                href={item.href}
                className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })
        )}
      </nav>

      <div className="border-sidebar-border bg-sidebar/50 text-muted-foreground space-y-1 border-t p-3 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span>{UI_COPY.COMMON.SIDEBAR.WORKER_DAEMON}</span>
          <span className="text-primary font-semibold">{UI_COPY.COMMON.STATUS.ONLINE}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{UI_COPY.COMMON.SIDEBAR.REDIS_QUEUE}</span>
          <span className="text-primary font-semibold">{UI_COPY.COMMON.STATUS.CONNECTED}</span>
        </div>
      </div>
    </aside>
  );
}
