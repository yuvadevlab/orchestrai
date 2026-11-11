"use client";

/**
 * @file studio-inspector-telemetry.tsx
 * @description Telemetry metrics and engine state for the studio inspector rail.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { UI_COPY } from "@/lib/ui-copy";

export interface StudioInspectorTelemetryProps {
  readonly activeExecutionId?: string | null;
}

/**
 * Telemetry view in the studio inspector rail.
 */
export function StudioInspectorTelemetry({
  activeExecutionId,
}: StudioInspectorTelemetryProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          borderRadius: "var(--radius-md, 0.375rem)",
          border: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
          padding: "0.875rem",
        }}
      >
        <span
          className="orch-text-muted"
          style={{ fontSize: "0.625rem", textTransform: "uppercase" }}
        >
          {UI_COPY.STUDIO.INSPECTOR.HANDLE_LABEL}
        </span>
        <p className="orch-truncate orch-font-semibold" style={{ margin: 0, marginTop: "0.25rem" }}>
          {activeExecutionId || UI_COPY.STUDIO.INSPECTOR.IDLE}
        </p>
      </div>

      <div
        style={{
          borderRadius: "var(--radius-md, 0.375rem)",
          border: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
          padding: "0.875rem",
        }}
      >
        <span
          className="orch-text-muted"
          style={{ fontSize: "0.625rem", textTransform: "uppercase" }}
        >
          {UI_COPY.STUDIO.INSPECTOR.ENGINE_LABEL}
        </span>
        <p className="orch-font-semibold" style={{ margin: 0, marginTop: "0.25rem" }}>
          Universal Swarm Coordinator (v1.0.0)
        </p>
      </div>

      <div
        style={{
          borderRadius: "var(--radius-md, 0.375rem)",
          border: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
          padding: "0.875rem",
        }}
      >
        <span
          className="orch-text-muted"
          style={{ fontSize: "0.625rem", textTransform: "uppercase" }}
        >
          {UI_COPY.STUDIO.INSPECTOR.SANDBOX_LABEL}
        </span>
        <p
          className="orch-font-semibold orch-text-primary"
          style={{ margin: 0, marginTop: "0.25rem" }}
        >
          {UI_COPY.STUDIO.INSPECTOR.LOCAL_FIRST_STATUS}
        </p>
      </div>
    </div>
  );
}
