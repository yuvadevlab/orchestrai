/**
 * @file product-nav-items.ts
 * @description Core consolidated navigation destinations for the OrchestrAI Console.
 * @module apps/console/components/layout
 */

import { Activity, Bot, Cpu, Network, Wrench } from "lucide-react";

/**
 * 5 streamlined primary navigation hubs for the OrchestrAI Console.
 */
export const NAV_ITEMS = [
  { href: "/", label: "Swarm Studio", icon: Network },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/executions", label: "Executions", icon: Activity },
  { href: "/models", label: "Models", icon: Cpu },
] as const;
