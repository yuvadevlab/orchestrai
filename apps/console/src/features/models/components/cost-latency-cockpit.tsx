"use client";

/**
 * @file apps/console/src/features/models/components/cost-latency-cockpit.tsx
 * @description Real-time model routing, latency percentiles, and tenant budget telemetry cockpit.
 * @module apps/console/features/models/components
 */

import React, { useState } from "react";
import { Cpu } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { CostLatencyMetrics } from "./cost-latency-metrics";

interface ProviderTelemetry {
  providerId: string;
  name: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  costPer1kPrompt: number;
  costPer1kCompletion: number;
  availabilityPercent: number;
}

const TELEMETRY_MOCK: ProviderTelemetry[] = [
  {
    providerId: "openai",
    name: "OpenAI (GPT-4o)",
    p50Ms: 380,
    p95Ms: 820,
    p99Ms: 1450,
    costPer1kPrompt: 0.005,
    costPer1kCompletion: 0.015,
    availabilityPercent: 99.98,
  },
  {
    providerId: "anthropic",
    name: "Anthropic (Claude 3.5 Sonnet)",
    p50Ms: 410,
    p95Ms: 790,
    p99Ms: 1200,
    costPer1kPrompt: 0.003,
    costPer1kCompletion: 0.015,
    availabilityPercent: 99.95,
  },
  {
    providerId: "google",
    name: "Google (Gemini 1.5 Pro)",
    p50Ms: 320,
    p95Ms: 650,
    p99Ms: 980,
    costPer1kPrompt: 0.00125,
    costPer1kCompletion: 0.005,
    availabilityPercent: 99.99,
  },
];

/**
 * High-density operations cockpit for model routing latency and budget enforcement.
 */
export function CostLatencyCockpit(): React.JSX.Element {
  const [activeStrategy, setActiveStrategy] = useState<string>("LOWEST_LATENCY");

  const monthlyBudgetLimit = 500;
  const currentMonthSpend = 142.65;
  const spendPercent = Math.min(100, Math.round((currentMonthSpend / monthlyBudgetLimit) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Top Metrics Banner */}
      <CostLatencyMetrics
        currentMonthSpend={currentMonthSpend}
        monthlyBudgetLimit={monthlyBudgetLimit}
        spendPercent={spendPercent}
      />

      {/* Latency Percentiles & Rate Matrix */}
      <div
        style={{
          border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
          borderRadius: "var(--radius-md, 0.375rem)",
          padding: "1rem",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            marginBottom: "0.75rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Cpu style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
            <h3
              style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}
            >
              {UI_COPY.MODELS.COCKPIT.TABLE_TITLE}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {(["LOWEST_LATENCY", "LEAST_EXPENSIVE", "ROUND_ROBIN"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={activeStrategy === s ? "default" : "outline"}
                onClick={() => setActiveStrategy(s)}
                style={{
                  height: "1.75rem",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.625rem",
                }}
              >
                {UI_COPY.MODELS.COCKPIT.STRATEGIES[s] ?? s}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              fontSize: "0.75rem",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
                  color: "var(--mutedForeground)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                }}
              >
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.ENGINE}
                </th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.P50}
                </th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.P95}
                </th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.P99}
                </th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.PROMPT_1K}
                </th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.COMPL_1K}
                </th>
                <th style={{ paddingBottom: "0.5rem", fontWeight: 400 }}>
                  {UI_COPY.MODELS.COCKPIT.HEADERS.AVAILABILITY}
                </th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6875rem" }}>
              {TELEMETRY_MOCK.map((row) => (
                <tr
                  key={row.providerId}
                  style={{
                    borderBottom: "1px solid color-mix(in oklab, var(--border) 20%, transparent)",
                  }}
                >
                  <td
                    style={{
                      color: "var(--foreground)",
                      paddingBlock: "0.625rem",
                      fontFamily: "var(--font-sans, sans-serif)",
                      fontWeight: 500,
                    }}
                  >
                    {row.name}
                  </td>
                  <td style={{ paddingBlock: "0.625rem" }}>
                    {UI_COPY.MODELS.COCKPIT.LATENCY_MS(row.p50Ms)}
                  </td>
                  <td style={{ color: "var(--primary)", paddingBlock: "0.625rem" }}>
                    {UI_COPY.MODELS.COCKPIT.LATENCY_MS(row.p95Ms)}
                  </td>
                  <td style={{ paddingBlock: "0.625rem" }}>
                    {UI_COPY.MODELS.COCKPIT.LATENCY_MS(row.p99Ms)}
                  </td>
                  <td style={{ paddingBlock: "0.625rem" }}>
                    {UI_COPY.MODELS.COCKPIT.COST_FORMAT(row.costPer1kPrompt)}
                  </td>
                  <td style={{ paddingBlock: "0.625rem" }}>
                    {UI_COPY.MODELS.COCKPIT.COST_FORMAT(row.costPer1kCompletion)}
                  </td>
                  <td style={{ color: "var(--primary)", paddingBlock: "0.625rem" }}>
                    {UI_COPY.MODELS.COCKPIT.PERCENTAGE(row.availabilityPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
