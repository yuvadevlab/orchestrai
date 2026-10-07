"use client";

/**
 * @file studio-welcome.tsx
 * @description Welcome hero screen shown when a session has no messages yet.
 * Consumes dynamic suggestions from the platform suggestions API.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { usePlatformWelcome } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

export interface StudioWelcomeProps {
  /** Optional first name to personalise the greeting. */
  userFirstName?: string | null;
  /** Called when a suggestion chip is clicked — passes the chip text as the prompt. */
  onSelectPrompt?: (prompt: string) => void;
}

/**
 * Welcome hero for OrchestrAI Cowork Studio.
 * Displayed in the center feed when the active session has no messages.
 * Uses dynamic server-driven headline, subtitle, and starter chips.
 */
export function StudioWelcome({
  userFirstName,
  onSelectPrompt,
}: StudioWelcomeProps): React.JSX.Element {
  const { data: welcome } = usePlatformWelcome();
  const chips = welcome?.suggestions ?? [];

  const headline = React.useMemo(() => {
    if (welcome?.headline?.includes("{name}")) {
      // Substitute the {name} token from server-driven headline with first name
      return welcome.headline.replace(
        "{name}",
        userFirstName ?? UI_COPY.STUDIO.WELCOME.GREETING_FALLBACK_NAME,
      );
    }
    if (userFirstName) {
      return UI_COPY.STUDIO.WELCOME.GREETING(userFirstName);
    }
    return welcome?.headline ?? UI_COPY.STUDIO.WELCOME.FALLBACK_HEADLINE;
  }, [welcome?.headline, userFirstName]);

  const subtitle = welcome?.subtitle ?? UI_COPY.STUDIO.WELCOME.FALLBACK_SUBTITLE;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      {/* ── Gradient Headline ── */}
      <h1 className="text-gradient font-display text-4xl font-bold tracking-tight">{headline}</h1>

      {/* ── Subtitle ── */}
      <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>

      {/* ── Dynamic Suggestion Chips ── */}
      {onSelectPrompt && chips.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectPrompt(chip)}
              className="border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground rounded-full border px-3 py-1 text-xs transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
