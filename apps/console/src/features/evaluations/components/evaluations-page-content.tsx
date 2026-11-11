"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-page-content.tsx
 * @description Main dashboard view for model capability benchmarks and automated evaluation suites.
 * @module apps/console/features/evaluations/components
 */

import React from "react";
import { BarChart2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState, DetailPageSkeleton } from "@orchestrai/ui";
import { useEvaluationDatasets } from "../api";
import { EvaluationsRunnerCard } from "./evaluations-runner-card";
import { EvaluationsDatasetsList } from "./evaluations-datasets-list";
import { RubricGradingCard } from "./rubric-grading-card";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Capability evaluations and model benchmark suite dashboard.
 */
export function EvaluationsPageContent(): React.JSX.Element {
  const { data: datasets = [], isLoading } = useEvaluationDatasets();

  const totalTestCases = datasets.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <PageShell
      title={UI_COPY.EVALUATIONS.PAGE_TITLE}
      breadcrumb={UI_COPY.EVALUATIONS.BREADCRUMB}
      stats={
        isLoading ? undefined : UI_COPY.EVALUATIONS.STATS_DETAIL(datasets.length, totalTestCases)
      }
      description={UI_COPY.EVALUATIONS.PAGE_DESCRIPTION}
    >
      {isLoading ? (
        <DetailPageSkeleton />
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title={UI_COPY.EVALUATIONS.EMPTY_TITLE}
          description={UI_COPY.EVALUATIONS.EMPTY_DESC}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Benchmark Runner Station */}
          <EvaluationsRunnerCard datasets={datasets} />

          {/* Qualitative Prompt Rubric Engine */}
          <RubricGradingCard />

          {/* Registered Benchmark Datasets */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {UI_COPY.EVALUATIONS.SUITES_TITLE}
              </h3>
              <span style={{ color: "var(--mutedForeground)", fontSize: "0.75rem" }}>
                {UI_COPY.EVALUATIONS.SUITES_REGISTERED(datasets.length)}
              </span>
            </div>

            <EvaluationsDatasetsList datasets={datasets} isLoading={false} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
