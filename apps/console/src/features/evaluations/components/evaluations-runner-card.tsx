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
} from "@yuva-devlab/ui";
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
      toast.success(`Benchmark "${selectedDataset}" completed`);
    } catch {
      toast.error("Failed to run benchmark evaluation suite");
    }
  };

  return (
    <div className="border-border bg-card/60 rounded-md border p-4 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <BarChart2 className="text-primary size-4" />
        <h3 className="text-sm font-semibold tracking-tight">Run Capability Benchmark</h3>
      </div>
      <p className="text-muted-foreground mb-4 text-xs">
        Evaluate your cluster model against structured tool execution, reasoning steps, and accuracy
        metrics.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger className="border-border bg-background h-8 text-xs font-medium">
              <SelectValue placeholder="Select benchmark dataset" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground text-xs">
              {datasets.map((d) => (
                <SelectItem key={d.name} value={d.name} className="cursor-pointer text-xs">
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
          className="h-8 gap-1.5 text-xs font-medium"
        >
          {isRunning ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
          <span>{isRunning ? "Evaluating Swarm..." : "Run Benchmark"}</span>
        </Button>
      </div>

      {result && <EvaluationsResultsDisplay result={result} />}
    </div>
  );
}
