"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, useTheme } from "@yuva-devlab/ui";
import { Sun, Moon, Cpu, Zap } from "lucide-react";

/**
 * TopBar component for OrchestrAI Console.
 * Houses operational telemetry indicators, live queue status, and theme controls.
 */
export function TopBar(): React.JSX.Element {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  return (
    <header className="border-border bg-background/80 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur-sm">
      {/* Telemetry Pills */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/5 flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs"
        >
          <span className="bg-primary size-2 animate-pulse rounded-full" />
          <span className="text-primary font-semibold">Gateway Active</span>
          <span className="text-muted-foreground">· Local Core</span>
        </Badge>

        <Badge
          variant="secondary"
          className="hidden items-center gap-1.5 px-2.5 py-1 font-mono text-xs sm:flex"
        >
          <Cpu className="text-muted-foreground size-3.5" />
          <span>Outbox Bus: Connected</span>
        </Badge>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="h-8 cursor-pointer gap-1.5 px-2.5 font-mono text-xs"
        >
          {resolvedTheme === "dark" ? (
            <>
              <Sun className="size-3.5" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="size-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => router.push("/console")}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Zap className="size-3.5" />
          <span>New Execution</span>
        </Button>
      </div>
    </header>
  );
}
