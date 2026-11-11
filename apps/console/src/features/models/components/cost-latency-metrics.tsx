"use client";

/**
 * @file apps/console/src/features/models/components/cost-latency-metrics.tsx
 * @description Operational telemetry metric cards for latency, quota, and budget.
 * @module apps/console/features/models/components
 */

import React from "react";
import { Gauge, Zap, DollarSign, ShieldAlert } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

export interface CostLatencyMetricsProps {
  readonly currentMonthSpend: number;
  readonly monthlyBudgetLimit: number;
  readonly spendPercent: number;
}

/**
 * Top metrics banner displaying cluster p95, token spend, quota, and fallback cascade.
 */
export function CostLatencyMetrics({
  currentMonthSpend,
  monthlyBudgetLimit,
  spendPercent,
}: CostLatencyMetricsProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      <div
        style={{
          border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
          borderRadius: "var(--radius-md, 0.375rem)",
          padding: "0.75rem",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            color: "var(--mutedForeground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
          }}
        >
          <span>{UI_COPY.MODELS.COCKPIT.CLUSTER_P95_TITLE}</span>
          <Zap style={{ color: "var(--primary)", width: "0.875rem", height: "0.875rem" }} />
        </div>
        <span
          style={{
            color: "var(--foreground)",
            marginTop: "0.25rem",
            display: "block",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          {UI_COPY.MODELS.COCKPIT.LATENCY_MS(720)}
        </span>
        <span style={{ color: "var(--primary)", fontSize: "0.625rem" }}>
          {UI_COPY.MODELS.COCKPIT.CLUSTER_P95_ROUTING}
        </span>
      </div>

      <div
        style={{
          border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
          borderRadius: "var(--radius-md, 0.375rem)",
          padding: "0.75rem",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            color: "var(--mutedForeground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
          }}
        >
          <span>{UI_COPY.MODELS.COCKPIT.TOKEN_SPEND_TITLE}</span>
          <DollarSign style={{ color: "var(--primary)", width: "0.875rem", height: "0.875rem" }} />
        </div>
        <span
          style={{
            color: "var(--foreground)",
            marginTop: "0.25rem",
            display: "block",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          ${currentMonthSpend}
        </span>
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.625rem" }}>
          {UI_COPY.MODELS.COCKPIT.TOKEN_SPEND_CAP(spendPercent, monthlyBudgetLimit)}
        </span>
      </div>

      <div
        style={{
          border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
          borderRadius: "var(--radius-md, 0.375rem)",
          padding: "0.75rem",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            color: "var(--mutedForeground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
          }}
        >
          <span>{UI_COPY.MODELS.COCKPIT.QUOTA_STATUS_TITLE}</span>
          <Gauge style={{ color: "var(--primary)", width: "0.875rem", height: "0.875rem" }} />
        </div>
        <span
          style={{
            color: "var(--primary)",
            marginTop: "0.25rem",
            display: "block",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          {UI_COPY.MODELS.COCKPIT.QUOTA_STATUS_NORMAL}
        </span>
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.625rem" }}>
          {UI_COPY.MODELS.COCKPIT.QUOTA_WARNING(80)}
        </span>
      </div>

      <div
        style={{
          border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
          borderRadius: "var(--radius-md, 0.375rem)",
          padding: "0.75rem",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            color: "var(--mutedForeground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
          }}
        >
          <span>{UI_COPY.MODELS.COCKPIT.FALLBACK_CASCADE_TITLE}</span>
          <ShieldAlert style={{ color: "var(--primary)", width: "0.875rem", height: "0.875rem" }} />
        </div>
        <span
          style={{
            color: "var(--foreground)",
            marginTop: "0.25rem",
            display: "block",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          {UI_COPY.MODELS.COCKPIT.FALLBACK_CASCADE_TIERS(3)}
        </span>
        <span style={{ color: "var(--mutedForeground)", fontSize: "0.625rem" }}>
          {UI_COPY.MODELS.COCKPIT.FALLBACK_CASCADE_PATH}
        </span>
      </div>
    </div>
  );
}
