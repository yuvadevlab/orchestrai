"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Bot,
  ListOrdered,
  GitBranch,
  Wrench,
  Cpu,
  Settings,
  Activity,
  Layers,
} from "lucide-react";
import { Badge } from "@yuva-devlab/ui";

/**
 * Navigation item specification for the Console sidebar.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Console", href: "/", icon: Terminal },
  { label: "Agents", href: "/agents", icon: Bot, badge: "5" },
  { label: "Executions", href: "/executions", icon: ListOrdered, badge: "12" },
  { label: "Workflows", href: "/workflows", icon: GitBranch },
  { label: "Tools", href: "/tools", icon: Wrench, badge: "18" },
  { label: "Models", href: "/models", icon: Cpu },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Sidebar Navigation component for OrchestrAI Console.
 * Displays brand identity and navigable route links with active state highlighting.
 */
export function SidebarNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-sidebar flex h-screen w-64 shrink-0 flex-col border-r">
      {/* Header / Brand */}
      <div className="border-sidebar-border flex h-14 items-center gap-2.5 border-b px-4">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md font-bold shadow-sm">
          <Layers className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sidebar-foreground text-sm font-bold tracking-tight">
            OrchestrAI
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">v0.1.0 • local-first</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className="px-1.5 py-0 font-mono text-[10px]"
                >
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Telemetry */}
      <div className="border-sidebar-border bg-sidebar/50 text-muted-foreground space-y-1 border-t p-3 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span>Worker Daemon</span>
          <span className="text-primary font-semibold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Redis Queue</span>
          <span className="text-primary font-semibold">CONNECTED</span>
        </div>
      </div>
    </aside>
  );
}
