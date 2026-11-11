"use client";

/**
 * @file apps/console/src/features/memory/components/memory-recall-results.tsx
 * @description Renders matched semantic memory items and similarity scores.
 * @module apps/console/features/memory/components
 */

import React from "react";
import { Brain } from "lucide-react";
import { Badge } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { ScoredMemoryResult } from "../types";

export interface MemoryRecallResultsProps {
  readonly results: ScoredMemoryResult[];
  readonly queryText: string;
}

/**
 * Renders ranked recall results or an empty indicator.
 */
export function MemoryRecallResults({
  results,
  queryText,
}: MemoryRecallResultsProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        paddingTop: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
        }}
      >
        <span
          style={{
            color: "var(--mutedForeground)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {UI_COPY.MEMORY.RECALL_TESTER.MATCHES_COUNT(results.length, queryText)}
        </span>
      </div>

      {results.length === 0 ? (
        <div
          style={{
            border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm, 0.25rem)",
            paddingBlock: "1.5rem",
            textAlign: "center",
          }}
        >
          <Brain
            style={{
              color: "var(--mutedForeground)",
              marginBottom: "0.5rem",
              width: "1.5rem",
              height: "1.5rem",
            }}
          />
          <p style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", margin: 0 }}>
            {UI_COPY.MEMORY.RECALL_TESTER.NO_MATCHES}
          </p>
        </div>
      ) : (
        <div
          style={{
            maxHeight: "18rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            overflowY: "auto",
            paddingRight: "0.25rem",
          }}
        >
          {results.map((match, idx) => {
            const item = match.item;
            const score = Math.round(match.score * 100);

            return (
              <div
                key={item.memoryId || idx}
                style={{
                  border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--background) 80%, transparent)",
                  borderRadius: "var(--radius-sm, 0.25rem)",
                  padding: "0.75rem",
                  fontSize: "0.75rem",
                }}
              >
                <div
                  style={{
                    marginBottom: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Badge
                      variant="outline"
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.625rem",
                      }}
                    >
                      {item.memoryType}
                    </Badge>
                  </div>
                  <span
                    style={{
                      color: "var(--primary)",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.625rem",
                      fontWeight: 600,
                    }}
                  >
                    {score}% match
                  </span>
                </div>
                <p
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6875rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                >
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
