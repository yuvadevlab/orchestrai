"use client";

/**
 * @file studio-inspector-rail.tsx
 * @description Inspector sidebar panel showing live SSE stream and runtime execution telemetry.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { Activity, X } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { StudioEvent } from "../types";
import { StudioInspectorStream } from "./studio-inspector-stream";
import { StudioInspectorTelemetry } from "./studio-inspector-telemetry";

export interface StudioInspectorRailProps {
  events: StudioEvent[];
  isRunning: boolean;
  onClose?: () => void;
  activeExecutionId?: string | null;
}

/**
 * High-density sidebar displaying live SSE telemetry and audit logs with spacious layout.
 */
export function StudioInspectorRail({
  events,
  isRunning,
  onClose,
  activeExecutionId,
}: StudioInspectorRailProps): React.JSX.Element {
  const [tab, setTab] = useState<"stream" | "telemetry">("stream");

  return (
    <div className="orch-inspector-rail" style={{ width: "100%", height: "100%", padding: 0 }}>
      {/* Header */}
      <div
        className="orch-flex-row orch-justify-between"
        style={{
          height: "3.5rem",
          flexShrink: 0,
          alignItems: "center",
          borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          padding: "0.75rem 1.25rem",
        }}
      >
        <div className="orch-flex-row orch-gap-sm" style={{ alignItems: "center" }}>
          <div
            style={{
              display: "grid",
              width: "2rem",
              height: "2rem",
              placeItems: "center",
              borderRadius: "var(--radius-md, 0.375rem)",
              backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Activity style={{ width: "1rem", height: "1rem" }} />
          </div>
          <div>
            <span
              className="orch-font-semibold"
              style={{ fontSize: "0.875rem", letterSpacing: "-0.01em" }}
            >
              {UI_COPY.STUDIO.INSPECTOR.TITLE}
            </span>
            <p
              className="orch-text-muted orch-font-mono"
              style={{ margin: 0, marginTop: "0.125rem", fontSize: "0.625rem", lineHeight: 1 }}
            >
              {UI_COPY.STUDIO.INSPECTOR.SUBTITLE}
            </p>
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ width: "2rem", height: "2rem", padding: 0 }}
          >
            <X style={{ width: "1rem", height: "1rem" }} />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
          padding: "0.375rem",
          fontSize: "0.6875rem",
          gap: "0.25rem",
        }}
      >
        <button
          type="button"
          onClick={() => setTab("stream")}
          style={{
            flex: 1,
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.375rem 0",
            textAlign: "center",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            backgroundColor: tab === "stream" ? "var(--card)" : "transparent",
            color: tab === "stream" ? "var(--primary)" : "var(--mutedForeground)",
          }}
        >
          {UI_COPY.STUDIO.INSPECTOR.TAB_STREAM(events.length)}
        </button>
        <button
          type="button"
          onClick={() => setTab("telemetry")}
          style={{
            flex: 1,
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.375rem 0",
            textAlign: "center",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            backgroundColor: tab === "telemetry" ? "var(--card)" : "transparent",
            color: tab === "telemetry" ? "var(--primary)" : "var(--mutedForeground)",
          }}
        >
          {UI_COPY.STUDIO.INSPECTOR.TAB_TELEMETRY}
        </button>
      </div>

      {/* Body: Stream or Telemetry */}
      <div style={{ flex: "1 1 0%", overflowY: "auto", padding: "1rem" }}>
        {tab === "stream" ? (
          <StudioInspectorStream events={events} isRunning={isRunning} />
        ) : (
          <StudioInspectorTelemetry activeExecutionId={activeExecutionId} />
        )}
      </div>
    </div>
  );
}
