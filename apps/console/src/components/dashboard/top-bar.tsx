"use client";

/**
 * @file top-bar.tsx
 * @description Operational telemetry indicators, live tenant identity, theme toggles, guide drawer, and auth controls.
 * @module apps/console/components/dashboard
 */

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge, useTheme } from "@yuva-devlab/ui";
import { Sun, Moon, Cpu, Zap, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * TopBar component for OrchestrAI Console.
 * Houses operational telemetry indicators, live queue status, active tenant, and auth actions.
 */
export function TopBar(): React.JSX.Element {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="border-border bg-background/80 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur-sm">
      {/* Telemetry Pills */}
      <div className="flex items-center gap-2.5">
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

        {isAuthenticated && user && (
          <Badge
            variant="outline"
            className="border-border bg-secondary text-foreground hidden items-center gap-1.5 px-2.5 py-1 font-mono text-xs md:flex"
          >
            <User className="text-primary size-3" />
            <span>{user.name}</span>
          </Badge>
        )}
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

        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 cursor-pointer gap-1.5 font-mono text-xs"
            title="Sign out of current session"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-accent h-8 cursor-pointer gap-1.5 font-mono text-xs"
            >
              <LogIn className="size-3.5" />
              <span>Sign In</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
