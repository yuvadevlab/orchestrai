"use client";

/**
 * @file overview-page-content.tsx
 * @description Command Center overview page content with animated topology and prompt dispatcher.
 * @module apps/console/features/overview
 */

import React from "react";
import { CircleDot } from "lucide-react";
import { TopologyConstellation } from "./topology-constellation";
import { CommandCenterHero } from "./command-center-hero";
import { OverviewGrids } from "./overview-grids";
import { useOverview } from "@/features/overview/api";

export function OverviewPageContent(): React.JSX.Element {
  const { data: metrics } = useOverview();

  return (
    <main className="relative min-w-0 flex-1 overflow-y-auto">
      {/* Background Cybernetic Topo Vector */}
      <TopologyConstellation />

      <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col gap-10 px-5 py-10 md:px-8 md:py-14">
        {/* Header Bar */}
        <header className="flex items-center gap-3">
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.22em] uppercase">
            OrchestrAI / Command Center
          </span>
          <span className="border-primary/30 bg-primary/10 text-primary ml-auto inline-flex items-center gap-2 rounded-md border px-2 py-0.5 font-mono text-[10px]">
            <CircleDot className="size-3 animate-pulse" />
            {metrics.runningCount} live
          </span>
        </header>

        {/* Hero Section with Prompt Dispatcher */}
        <CommandCenterHero />

        {/* Agent Network, Recent Runs, System Pulse */}
        <OverviewGrids />
      </div>
    </main>
  );
}
