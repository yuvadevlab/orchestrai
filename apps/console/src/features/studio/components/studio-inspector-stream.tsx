"use client";

/**
 * @file studio-inspector-stream.tsx
 * @description Event stream listing for the studio inspector rail.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { UI_COPY } from "@/lib/ui-copy";
import type { StudioEvent } from "../types";

export interface StudioInspectorStreamProps {
  readonly events: StudioEvent[];
  readonly isRunning: boolean;
}

/**
 * List of live SSE events in the inspector rail.
 */
export function StudioInspectorStream({
  events,
  isRunning,
}: StudioInspectorStreamProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {events.length === 0 ? (
        <div
          className="orch-text-muted"
          style={{
            padding: "3rem 0",
            textAlign: "center",
            fontSize: "0.6875rem",
            opacity: 0.6,
          }}
        >
          {isRunning
            ? UI_COPY.STUDIO.INSPECTOR.AWAITING_STREAM
            : UI_COPY.STUDIO.INSPECTOR.NO_LIVE_EVENTS}
        </div>
      ) : (
        events.map((evt) => (
          <div
            key={evt.id}
            style={{
              borderRadius: "var(--radius-md, 0.375rem)",
              border: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
              backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
              padding: "0.75rem",
              fontSize: "0.6875rem",
            }}
          >
            <div className="orch-flex-row orch-justify-between orch-text-muted">
              <span className="orch-text-primary orch-font-semibold">{evt.agent}</span>
              <span>{evt.meta}</span>
            </div>
            <p style={{ margin: 0, marginTop: "0.25rem", fontWeight: 500 }}>{evt.title}</p>
            {evt.detail && (
              <p
                className="orch-text-muted"
                style={{
                  margin: 0,
                  marginTop: "0.25rem",
                  fontSize: "0.625rem",
                  wordBreak: "break-all",
                }}
              >
                {evt.detail}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
