"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-datasets-list.tsx
 * @description List of benchmark evaluation datasets and their test item criteria.
 * @module apps/console/features/evaluations/components
 */

import React from "react";
import { Database, Wrench } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeleton";
import { UI_COPY } from "@/lib/ui-copy";
import type { EvaluationDataset } from "../types";

export interface EvaluationsDatasetsListProps {
  readonly datasets: EvaluationDataset[];
  readonly isLoading: boolean;
}

/**
 * Renders registered benchmark datasets and test item prompts.
 */
export function EvaluationsDatasetsList({
  datasets,
  isLoading,
}: EvaluationsDatasetsListProps): React.JSX.Element {
  if (isLoading) {
    return <TableSkeleton rows={3} />;
  }

  return (
    <div className="space-y-4">
      {datasets.map((dataset) => (
        <div
          key={dataset.name}
          className="border-border bg-card/40 rounded-md border p-4 backdrop-blur"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="text-primary size-4" />
              <h4 className="text-xs font-semibold">{dataset.name}</h4>
            </div>
            <span className="border-border/80 bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
              {UI_COPY.EVALUATIONS.DATASETS.TEST_CASES_BADGE(dataset.items.length)}
            </span>
          </div>

          {dataset.description && (
            <p className="text-muted-foreground mb-3 text-xs">{dataset.description}</p>
          )}

          <div className="divide-border/40 divide-y rounded border">
            {dataset.items.map((item, idx) => (
              <div key={item.id} className="p-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-muted-foreground mr-1.5 font-mono text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="text-foreground/90 font-mono text-[11px]">
                      &quot;{item.prompt}&quot;
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Wrench className="text-muted-foreground size-3" />
                    <span className="text-primary font-mono text-[10px]">
                      {item.expectedTools.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
