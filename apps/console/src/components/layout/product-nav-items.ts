/**
 * @file product-nav-items.ts
 * @description Core consolidated navigation destinations for the OrchestrAI Console.
 * @module apps/console/components/layout
 */

import { Activity, BarChart2, Bot, Cpu, Layers, Network, Wrench } from "lucide-react";

/**
 * 7 streamlined primary navigation hubs for the OrchestrAI Console.
 */
export const NAV_ITEMS = [
  { href: "/", label: "Swarm Studio", icon: Network },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/context", label: "Context Hub", icon: Layers },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/executions", label: "Executions", icon: Activity },
  { href: "/models", label: "Models & Routing", icon: Cpu },
  { href: "/evaluations", label: "Evaluations", icon: BarChart2 },
] as const;
