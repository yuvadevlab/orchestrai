/**
 * @file apps/console/src/lib/nav-icon-mapper.ts
 * @description Dynamic Lucide icon resolver for database-driven navigation items.
 * @module apps/console/lib
 */

import React from "react";
import {
  Activity,
  Bot,
  Box,
  Cpu,
  Database,
  FileCode,
  Folder,
  GitBranch,
  Layers,
  LayoutGrid,
  ListOrdered,
  MessageSquare,
  Network,
  Play,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react";

/** Map of string identifiers to Lucide icon components. */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Network,
  Bot,
  Cpu,
  Play,
  Wrench,
  Settings,
  Shield,
  Layers,
  Activity,
  Terminal,
  GitBranch,
  ListOrdered,
  LayoutGrid,
  Box,
  Database,
  FileCode,
  Folder,
  MessageSquare,
  Users,
  Wand2,
  Zap,
};

/**
 * Resolves a Lucide icon component by string name.
 * Falls back to Layers if the icon name is unspecified or unmapped.
 *
 * @param iconName - String name of the icon (e.g. "Sparkles", "Bot", "Cpu")
 * @returns React icon component
 */
export function getNavIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) {
    return Layers;
  }
  return ICON_MAP[iconName] ?? Layers;
}
