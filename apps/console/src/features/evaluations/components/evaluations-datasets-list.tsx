"use client";

/**
 * @file apps/console/src/features/evaluations/components/evaluations-datasets-list.tsx
 * @description List of benchmark evaluation datasets and their test item criteria.
 * @module apps/console/features/evaluations/components
 */

import React from "react";
import { Database, Wrench } from "lucide-react";
import { TableSkeleton } from "@orchestrai/ui/components/skeleton";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {datasets.map((dataset) => (
        <div
          key={dataset.name}
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "color-mix(in oklab, var(--card) 40%, transparent)",
            borderRadius: "var(--radius-md, 0.375rem)",
            padding: "1rem",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Database style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
              <h4 style={{ fontSize: "0.75rem", fontWeight: 600, margin: 0 }}>{dataset.name}</h4>
            </div>
            <span
              style={{
                border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                backgroundColor: "color-mix(in oklab, var(--muted) 60%, transparent)",
                color: "var(--mutedForeground)",
                borderRadius: "var(--radius-sm, 0.25rem)",
                paddingInline: "0.375rem",
                paddingBlock: "0.125rem",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.625rem",
              }}
            >
              {UI_COPY.EVALUATIONS.DATASETS.TEST_CASES_BADGE(dataset.items.length)}
            </span>
          </div>

          {dataset.description && (
            <p
              style={{
                color: "var(--mutedForeground)",
                marginBottom: "0.75rem",
                fontSize: "0.75rem",
                marginInline: 0,
              }}
            >
              {dataset.description}
            </p>
          )}

          <div
            style={{
              border: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
              borderRadius: "var(--radius-sm, 0.25rem)",
            }}
          >
            {dataset.items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: "0.625rem",
                  fontSize: "0.75rem",
                  borderBottom:
                    idx < dataset.items.length - 1
                      ? "1px solid color-mix(in oklab, var(--border) 40%, transparent)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        color: "var(--mutedForeground)",
                        marginRight: "0.375rem",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6875rem",
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <span
                      style={{
                        color: "var(--foreground)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6875rem",
                      }}
                    >
                      &quot;{item.prompt}&quot;
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: "0.25rem" }}
                  >
                    <Wrench
                      style={{
                        color: "var(--mutedForeground)",
                        width: "0.75rem",
                        height: "0.75rem",
                      }}
                    />
                    <span
                      style={{
                        color: "var(--primary)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.625rem",
                      }}
                    >
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
