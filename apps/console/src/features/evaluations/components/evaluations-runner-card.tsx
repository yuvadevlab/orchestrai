"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-runner-card.tsx
 * @description Benchmark execution launcher with dataset selection and live scoring.
 * @module apps/console/features/evaluations/components
 */

import React, { useState } from "react";
import { Play, Loader2, BarChart2 } from "lucide-react";
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  toast,
} from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useRunBenchmark } from "../api";
import { EvaluationsResultsDisplay } from "./evaluations-results-display";
import type { EvaluationDataset } from "../types";

export interface EvaluationsRunnerCardProps {
  datasets: EvaluationDataset[];
}

/**
 * Workbench card to trigger benchmark evaluation runs against models.
 */
export function EvaluationsRunnerCard({ datasets }: EvaluationsRunnerCardProps): React.JSX.Element {
  const [selectedDataset, setSelectedDataset] = useState<string>(datasets[0]?.name ?? "");
  const { runBenchmark, result, isRunning } = useRunBenchmark();

  const handleRun = async (): Promise<void> => {
    if (!selectedDataset) return;
    try {
      await runBenchmark({ datasetName: selectedDataset });
      toast.success(UI_COPY.EVALUATIONS.RUNNER.TOAST_COMPLETED(selectedDataset));
    } catch {
      toast.error(UI_COPY.EVALUATIONS.RUNNER.TOAST_ERROR);
    }
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
        borderRadius: "var(--radius-md, 0.375rem)",
        padding: "1rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <BarChart2 style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>
          {UI_COPY.EVALUATIONS.RUNNER.CARD_TITLE}
        </h3>
      </div>
      <p
        style={{
          color: "var(--mutedForeground)",
          marginBottom: "1rem",
          fontSize: "0.75rem",
          marginInline: 0,
        }}
      >
        {UI_COPY.EVALUATIONS.RUNNER.CARD_DESC}
      </p>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div style={{ width: "16rem", maxWidth: "100%" }}>
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger style={{ height: "2rem", fontSize: "0.75rem", fontWeight: 500 }}>
              <SelectValue placeholder={UI_COPY.EVALUATIONS.RUNNER.SELECT_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((d) => (
                <SelectItem
                  key={d.name}
                  value={d.name}
                  style={{ cursor: "pointer", fontSize: "0.75rem" }}
                >
                  {d.name} ({d.items.length} items)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleRun}
          disabled={isRunning || !selectedDataset}
          size="sm"
          style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
        >
          {isRunning ? (
            <Loader2
              style={{
                width: "0.875rem",
                height: "0.875rem",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <Play style={{ width: "0.875rem", height: "0.875rem", fill: "currentColor" }} />
          )}
          <span>
            {isRunning
              ? UI_COPY.EVALUATIONS.RUNNER.RUNNING_BUTTON
              : UI_COPY.EVALUATIONS.RUNNER.RUN_BUTTON}
          </span>
        </Button>
      </div>

      {result && <EvaluationsResultsDisplay result={result} />}
    </div>
  );
}
