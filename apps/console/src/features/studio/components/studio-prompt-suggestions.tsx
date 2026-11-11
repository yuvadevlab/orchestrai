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
    <div className="orch-prompt-suggestions">
      {suggestions.map((s) => (
        <button key={s} type="button" onClick={() => onSelect(s)} className="orch-prompt-pill">
          {s}
        </button>
      ))}
    </div>
  );
}
