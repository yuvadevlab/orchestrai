"use client";

/**
 * @file sidebar-nav.tsx
 * @description Sidebar navigation component dynamically populated from database API.
 * @module apps/console/components/dashboard
 * @author yuva.devlab@gmail.com
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
    <aside className="orch-sidebar">
      <div className="orch-sidebar__brand">
        <div className="orch-sidebar__logo">
          <Layers style={{ width: "1rem", height: "1rem" }} />
        </div>
        <div className="orch-sidebar__brand-meta">
          <span className="orch-sidebar__brand-name">{brandName}</span>
          <span className="orch-sidebar__brand-version">{brandVersion}</span>
        </div>
      </div>

      <nav className="orch-sidebar__nav">
        {navItems.length === 0 ? (
          <div
            style={{
              color: "color-mix(in oklab, var(--mutedForeground) 60%, transparent)",
              padding: "1rem 0.75rem",
              fontSize: "0.75rem",
              fontStyle: "italic",
            }}
          >
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
                className={`orch-sidebar__link ${isActive ? "orch-sidebar__link--active" : ""}`}
              >
                <div className="orch-sidebar__link-content">
                  <Icon
                    style={{
                      width: "1rem",
                      height: "1rem",
                      color: isActive ? "var(--primary)" : "var(--mutedForeground)",
                    }}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })
        )}
      </nav>

      <div className="orch-sidebar__footer">
        <div className="orch-sidebar__footer-row">
          <span>{UI_COPY.COMMON.SIDEBAR.WORKER_DAEMON}</span>
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            {UI_COPY.COMMON.STATUS.ONLINE}
          </span>
        </div>
        <div className="orch-sidebar__footer-row">
          <span>{UI_COPY.COMMON.SIDEBAR.REDIS_QUEUE}</span>
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            {UI_COPY.COMMON.STATUS.CONNECTED}
          </span>
        </div>
      </div>
    </aside>
  );
}
