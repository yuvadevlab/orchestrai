/**
 * @file product-nav-items.ts
 * @description Constant navigation destination items for the product navigation rail.
 * @module apps/console/components/layout
 */

import {
  Activity,
  Bot,
  Boxes,
  Brain,
  Cpu,
  GaugeCircle,
  GitBranch,
  MessagesSquare,
  Network,
  Radio,
  Settings2,
  Waypoints,
  Wrench,
} from "lucide-react";

/**
 * 13 canonical destination specifications for the OrchestrAI Console.
 */
export const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Waypoints },
  { href: "/console", label: "Console", icon: Network },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/executions", label: "Executions", icon: Activity },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/knowledge", label: "Knowledge", icon: Boxes },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/events", label: "Events", icon: Radio },
  { href: "/evaluations", label: "Evaluations", icon: GaugeCircle },
  { href: "/activity", label: "Activity", icon: Settings2 },
] as const;
