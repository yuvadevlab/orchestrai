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
 */
export function StudioWelcome({
  userFirstName,
  onSelectPrompt,
}: StudioWelcomeProps): React.JSX.Element {
  const { data: welcome } = usePlatformWelcome();
  const chips = welcome?.suggestions ?? [];

  const headline = React.useMemo(() => {
    if (welcome?.headline?.includes("{name}")) {
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
    <div
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        width: "100%",
        maxWidth: "48rem",
        flex: "1 1 0%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
      }}
    >
      {/* ── Headline ── */}
      <h1
        className="orch-font-bold"
        style={{ fontSize: "2.25rem", lineHeight: "2.5rem", letterSpacing: "-0.025em" }}
      >
        {headline}
      </h1>

      {/* ── Subtitle ── */}
      <p className="orch-text-muted" style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
        {subtitle}
      </p>

      {/* ── Dynamic Suggestion Chips ── */}
      {onSelectPrompt && chips.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectPrompt(chip)}
              className="orch-prompt-pill"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
