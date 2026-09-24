"use client";

/**
 * @file studio-welcome.tsx
 * @description Welcome hero screen shown when a session has no messages yet.
 *
 * Per user request: the 4 feature starter cards (Deep Research, Author Documents,
 * Build & Automate, Data Analysis) are intentionally omitted. The prompt bar
 * (StudioPromptBar) already floats below this component inside the workspace.
 * @module apps/console/features/studio/components
 */

import React from "react";

/** Suggestion chips — quick-select prompts that populate the composer. */
const SUGGESTION_CHIPS = [
  "Analyze market competitors",
  "Draft product requirements",
  "Automate data pipeline",
  "Review this codebase",
  "Build a 90-day roadmap",
] as const;

export interface StudioWelcomeProps {
  /** Optional first name to personalise the greeting. */
  userFirstName?: string | null;
  /** Called when a suggestion chip is clicked — passes the chip text as the prompt. */
  onSelectPrompt?: (prompt: string) => void;
}

/**
 * Welcome hero for OrchestrAI Cowork Studio.
 * Displayed in the center feed when the active session has no messages.
 */
export function StudioWelcome({
  userFirstName,
  onSelectPrompt,
}: StudioWelcomeProps): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      {/* ── Gradient Headline ── */}
      <h1 className="text-gradient font-display text-4xl font-bold tracking-tight">
        {userFirstName
          ? `What should we tackle, ${userFirstName}?`
          : "What should your agents take on?"}
      </h1>

      {/* ── Subtitle ── */}
      <p className="text-muted-foreground mt-2 text-sm">
        One objective. A swarm of specialists. Auditable results.
      </p>

      {/* ── Suggestion Chips ── */}
      {onSelectPrompt && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
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
