"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-results-display.tsx
 * @description Benchmark scorecard rendering accuracy gauge, passed items count, and mean latency.
 * @module apps/console/features/evaluations/components
 */

import React from "react";
import { CheckCircle2, Clock, Target, Award } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import type { BenchmarkResult } from "../types";

export interface EvaluationsResultsDisplayProps {
  result: BenchmarkResult;
}

/**
 * Visual scorecard for benchmark evaluation outcomes.
 */
export function EvaluationsResultsDisplay({
  result,
}: EvaluationsResultsDisplayProps): React.JSX.Element {
  const isHighAccuracy = result.accuracyPercentage >= 80;

  return (
    <div
      style={{
        border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
        backgroundColor: "color-mix(in oklab, var(--background) 80%, transparent)",
        borderRadius: "var(--radius-md, 0.375rem)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Award style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
          <h4 style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>
            {UI_COPY.EVALUATIONS.RESULTS.TITLE}
          </h4>
        </div>
        <span
          style={{
            color: "var(--mutedForeground)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
          }}
        >
          {result.datasetName}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        {/* Accuracy Gauge */}
        <div
          style={{
            border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "var(--mutedForeground)", fontSize: "0.6875rem" }}>
              {UI_COPY.EVALUATIONS.RESULTS.ACCURACY_LABEL}
            </span>
            <Target style={{ color: "var(--primary)", width: "0.875rem", height: "0.875rem" }} />
          </div>
          <div
            style={{ marginTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: isHighAccuracy ? "var(--primary)" : "var(--warning, #eab308)",
              }}
            >
              {result.accuracyPercentage.toFixed(0)}%
            </span>
          </div>
          <div
            style={{
              backgroundColor: "var(--muted)",
              marginTop: "0.5rem",
              height: "0.375rem",
              width: "100%",
              overflow: "hidden",
              borderRadius: "9999px",
            }}
          >
            <div
              style={{
                height: "100%",
                transition: "all 150ms ease",
                backgroundColor: isHighAccuracy ? "var(--primary)" : "var(--warning, #eab308)",
                width: `${result.accuracyPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Test Items Passed */}
        <div
          style={{
            border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "var(--mutedForeground)", fontSize: "0.6875rem" }}>
              {UI_COPY.EVALUATIONS.RESULTS.PASSED_LABEL}
            </span>
            <CheckCircle2
              style={{ color: "var(--primary)", width: "0.875rem", height: "0.875rem" }}
            />
          </div>
          <div
            style={{ marginTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}
          >
            <span
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              {result.passedItems}
            </span>
            <span
              style={{
                color: "var(--mutedForeground)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
              }}
            >
              / {result.totalItems}
            </span>
          </div>
          <span
            style={{ color: "var(--mutedForeground)", marginTop: "0.5rem", fontSize: "0.625rem" }}
          >
            {result.totalItems - result.passedItems === 0
              ? UI_COPY.EVALUATIONS.RESULTS.ALL_PASSED
              : UI_COPY.EVALUATIONS.RESULTS.FAILED_COUNT(result.totalItems - result.passedItems)}
          </span>
        </div>

        {/* Mean Latency */}
        <div
          style={{
            border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "var(--mutedForeground)", fontSize: "0.6875rem" }}>
              {UI_COPY.EVALUATIONS.RESULTS.LATENCY_LABEL}
            </span>
            <Clock
              style={{ color: "var(--mutedForeground)", width: "0.875rem", height: "0.875rem" }}
            />
          </div>
          <div
            style={{ marginTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}
          >
            <span
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              {result.meanLatencyMs.toFixed(0)}
            </span>
            <span
              style={{
                color: "var(--mutedForeground)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
              }}
            >
              {UI_COPY.EVALUATIONS.RESULTS.MS_PER_ITEM}
            </span>
          </div>
          <span
            style={{ color: "var(--mutedForeground)", marginTop: "0.5rem", fontSize: "0.625rem" }}
          >
            {UI_COPY.EVALUATIONS.RESULTS.SPEED_LABEL}
          </span>
        </div>
      </div>
    </div>
  );
}
