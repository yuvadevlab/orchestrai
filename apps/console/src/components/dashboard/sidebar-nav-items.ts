/**
 * @file sidebar-nav-items.ts
 * @description Constant navigation item specifications for the sidebar navigation.
 * @module apps/console/components/dashboard
 */

import React from "react";
import {
  Terminal,
  Bot,
  ListOrdered,
  GitBranch,
  Wrench,
  Cpu,
  Settings,
  Activity,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Console", href: "/", icon: Terminal },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Executions", href: "/executions", icon: ListOrdered },
  { label: "Workflows", href: "/workflows", icon: GitBranch },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Models", href: "/models", icon: Cpu },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];
