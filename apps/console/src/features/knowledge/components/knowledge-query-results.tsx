"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-query-results.tsx
 * @description Renders matched chunk results and score bars for RAG query testing.
 * @module apps/console/features/knowledge/components
 */

import React from "react";
import { Database } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import type { KnowledgeQueryResult } from "../types";

export interface KnowledgeQueryResultsProps {
  readonly result: KnowledgeQueryResult;
}

/**
 * Matched chunks and similarity score breakdown for knowledge queries.
 */
export function KnowledgeQueryResults({ result }: KnowledgeQueryResultsProps): React.JSX.Element {
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
          {UI_COPY.KNOWLEDGE.QUERY_TESTER.MATCHES_COUNT(result.chunks.length, result.query)}
        </span>
      </div>

      {result.chunks.length === 0 ? (
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
          <Database
            style={{
              color: "var(--mutedForeground)",
              marginBottom: "0.5rem",
              width: "1.5rem",
              height: "1.5rem",
            }}
          />
          <p style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", margin: 0 }}>
            {UI_COPY.KNOWLEDGE.QUERY_TESTER.NO_MATCHES}
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
          {result.chunks.map((chunk, idx) => {
            const scorePercent = Math.round(chunk.score * 100);
            return (
              <div
                key={chunk.chunkId || idx}
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
                  <span
                    style={{
                      color: "var(--mutedForeground)",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.6875rem",
                    }}
                  >
                    Chunk #{idx + 1}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div
                      style={{
                        height: "0.375rem",
                        width: "4rem",
                        overflow: "hidden",
                        borderRadius: "9999px",
                        backgroundColor: "var(--muted)",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          backgroundColor: "var(--primary)",
                          transition: "all 150ms ease",
                          width: `${Math.min(100, Math.max(0, scorePercent))}%`,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "var(--primary)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.625rem",
                        fontWeight: 600,
                      }}
                    >
                      {scorePercent}% match
                    </span>
                  </div>
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
                  {chunk.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
