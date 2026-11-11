"use client";

/**
 * @file theme-toggle.tsx
 * @description Theme mode switcher button with smooth icon transition.
 * Uses the shared useTheme from @orchestrai/ui so theme state is managed
 * by ConfigProvider (sets data-brand/data-theme on html) — not the local
 * ThemeProvider which writes class="dark/light" and conflicts with the CSS.
 * @module apps/console/components/layout
 */

import React from "react";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, useTheme } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";

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
          aria-label={UI_COPY.COMMON.A11Y.TOGGLE_THEME}
          className="orch-nav-rail__btn"
        >
          {resolvedTheme === "dark" ? (
            <Sun style={{ width: "1rem", height: "1rem" }} />
          ) : (
            <Moon style={{ width: "1rem", height: "1rem" }} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="orch-font-mono" style={{ fontSize: "0.75rem" }}>
        {resolvedTheme === "dark"
          ? UI_COPY.COMMON.A11Y.SWITCH_LIGHT
          : UI_COPY.COMMON.A11Y.SWITCH_DARK}
      </TooltipContent>
    </Tooltip>
  );
}
