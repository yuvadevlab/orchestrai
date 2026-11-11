"use client";

/**
 * @file artifact-search-card.tsx
 * @description Web search and cited sources artifact view with domain tags and relevance ratings.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Globe, Search } from "lucide-react";
import { Badge } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { CoworkArtifact } from "../../types";

export interface ArtifactSearchCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders web search citations and retrieved intelligence snippets (default collapsed).
 */
export function ArtifactSearchCard({ artifact }: ArtifactSearchCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const sources = Array.isArray(artifact.metadata?.sources)
    ? (artifact.metadata.sources as Array<{ title: string; url: string; snippet?: string }>)
    : [];

  return (
    <div className="orch-artifact-card">
      <div className={`orch-artifact-header ${isExpanded ? "is-expanded" : ""}`}>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="orch-artifact-trigger"
        >
          <Search
            style={{ width: "1rem", height: "1rem", flexShrink: 0, color: "var(--primary)" }}
          />
          <span className="orch-truncate orch-font-semibold">{artifact.title}</span>
          <span
            className="orch-flex-row orch-gap-xs orch-text-muted"
            style={{ fontSize: "0.625rem", alignItems: "center", marginLeft: "0.25rem" }}
          >
            <span>{isExpanded ? UI_COPY.COMMON.ACTIONS.HIDE : UI_COPY.COMMON.ACTIONS.SHOW}</span>
            {isExpanded ? (
              <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} />
            ) : (
              <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
            )}
          </span>
        </button>

        {sources.length > 0 && (
          <Badge
            variant="outline"
            className="orch-font-mono"
            style={{ padding: "0 0.375rem", fontSize: "0.625rem" }}
          >
            {UI_COPY.STUDIO.ARTIFACTS.SOURCES_COUNT(sources.length)}
          </Badge>
        )}
      </div>

      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "1rem" }}>
          {sources.length > 0 ? (
            sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="orch-artifact-search-link"
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    className="orch-flex-row orch-gap-xs"
                    style={{ alignItems: "center", fontSize: "0.75rem", fontWeight: 500 }}
                  >
                    <Globe
                      className="orch-text-muted"
                      style={{ width: "0.875rem", height: "0.875rem" }}
                    />
                    <span className="orch-truncate">{src.title}</span>
                  </div>
                  {src.snippet && (
                    <p
                      className="orch-text-muted"
                      style={{
                        marginTop: "0.25rem",
                        fontSize: "0.6875rem",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {src.snippet}
                    </p>
                  )}
                </div>
                <ExternalLink
                  className="orch-text-muted"
                  style={{
                    marginTop: "0.125rem",
                    marginLeft: "0.5rem",
                    width: "0.875rem",
                    height: "0.875rem",
                    flexShrink: 0,
                  }}
                />
              </a>
            ))
          ) : (
            <div className="orch-artifact-body" style={{ whiteSpace: "pre-wrap" }}>
              {artifact.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
