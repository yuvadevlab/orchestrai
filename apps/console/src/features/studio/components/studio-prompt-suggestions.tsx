"use client";

/**
 * @file studio-prompt-suggestions.tsx
 * @description Quick suggestion pills rendered above the studio floating command prompt bar.
 * @module apps/console/features/studio/components
 */

import React from "react";

export interface StudioPromptSuggestionsProps {
  readonly suggestions: readonly string[];
  readonly onSelect: (suggestion: string) => void;
  readonly isRunning: boolean;
}

/**
 * Renders quick starter suggestion pills.
 */
export function StudioPromptSuggestions({
  suggestions,
  onSelect,
  isRunning,
}: StudioPromptSuggestionsProps): React.JSX.Element | null {
  if (isRunning || !suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="border-border/60 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
