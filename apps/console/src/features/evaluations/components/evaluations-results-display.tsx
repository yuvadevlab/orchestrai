"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-results-display.tsx
 * @description Benchmark scorecard rendering accuracy gauge, passed items count, and mean latency.
 * @module apps/console/features/evaluations/components
 */

import React from "react";
import { CheckCircle2, Clock, Target, Award } from "lucide-react";
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
    <div className="border-border/80 bg-background/80 rounded-md border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Award className="text-primary size-4" />
          <h4 className="text-xs font-semibold tracking-tight">Benchmark Results</h4>
        </div>
        <span className="text-muted-foreground font-mono text-[11px]">{result.datasetName}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Accuracy Gauge */}
        <div className="border-border/60 bg-card/60 flex flex-col justify-between rounded border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Accuracy</span>
            <Target className="text-primary size-3.5" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`font-mono text-2xl font-bold ${
                isHighAccuracy ? "text-primary" : "text-warning"
              }`}
            >
              {result.accuracyPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={`h-full transition-all ${isHighAccuracy ? "bg-primary" : "bg-warning"}`}
              style={{ width: `${result.accuracyPercentage}%` }}
            />
          </div>
        </div>

        {/* Test Items Passed */}
        <div className="border-border/60 bg-card/60 flex flex-col justify-between rounded border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Passed Items</span>
            <CheckCircle2 className="text-primary size-3.5" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-foreground font-mono text-2xl font-bold">
              {result.passedItems}
            </span>
            <span className="text-muted-foreground font-mono text-xs">/ {result.totalItems}</span>
          </div>
          <span className="text-muted-foreground mt-2 text-[10px]">
            {result.totalItems - result.passedItems === 0
              ? "All test cases satisfied"
              : `${result.totalItems - result.passedItems} failed assertions`}
          </span>
        </div>

        {/* Mean Latency */}
        <div className="border-border/60 bg-card/60 flex flex-col justify-between rounded border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Mean Latency</span>
            <Clock className="text-muted-foreground size-3.5" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-foreground font-mono text-2xl font-bold">
              {result.meanLatencyMs.toFixed(0)}
            </span>
            <span className="text-muted-foreground font-mono text-xs">ms / item</span>
          </div>
          <span className="text-muted-foreground mt-2 text-[10px]">
            Inference & tool dispatch speed
          </span>
        </div>
      </div>
    </div>
  );
}
