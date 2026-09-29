"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-page-content.tsx
 * @description Main dashboard view for model capability benchmarks and automated evaluation suites.
 * @module apps/console/features/evaluations/components
 */

import React from "react";
import { BarChart2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui";
import { useEvaluationDatasets } from "../api";
import { EvaluationsRunnerCard } from "./evaluations-runner-card";
import { EvaluationsDatasetsList } from "./evaluations-datasets-list";

/**
 * Capability evaluations and model benchmark suite dashboard.
 */
export function EvaluationsPageContent(): React.JSX.Element {
  const { data: datasets = [], isLoading } = useEvaluationDatasets();

  const totalTestCases = datasets.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <PageShell
      title="Capability Evaluations"
      breadcrumb="Evaluations"
      stats={
        isLoading
          ? "Loading suites..."
          : `${datasets.length} benchmark suites (${totalTestCases} test cases)`
      }
      description="Score model reasoning, tool invocation accuracy, and response latency against standardized test suites."
    >
      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
          <span className="text-muted-foreground animate-pulse text-xs">
            Loading benchmark suites from gateway...
          </span>
        </div>
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No Benchmark Suites Available"
          description="Registered benchmark datasets evaluate model reasoning, tool JSON calling, and multi-step plans."
        />
      ) : (
        <div className="space-y-6">
          {/* Benchmark Runner Station */}
          <EvaluationsRunnerCard datasets={datasets} />

          {/* Registered Benchmark Datasets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">Available Benchmark Suites</h3>
              <span className="text-muted-foreground text-xs">
                {datasets.length} suites registered
              </span>
            </div>

            <EvaluationsDatasetsList datasets={datasets} isLoading={false} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
