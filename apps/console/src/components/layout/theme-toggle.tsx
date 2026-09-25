"use client";

/**
 * @file theme-toggle.tsx
 * @description Theme mode switcher button with smooth icon transition.
 * Uses the shared useTheme from @yuva-devlab/ui so theme state is managed
 * by ConfigProvider (sets data-brand/data-theme on html) — not the local
 * ThemeProvider which writes class="dark/light" and conflicts with the CSS.
 * @module apps/console/components/layout
 */

import React from "react";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, useTheme } from "@yuva-devlab/ui";

/**
 * Interactive button that toggles between light and dark color schemes.
 */
export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = (): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Toggle color theme"
          className="text-muted-foreground hover:bg-accent hover:text-foreground grid size-9 shrink-0 cursor-pointer place-items-center rounded-md transition-colors"
        >
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-mono text-xs">
        {resolvedTheme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}
