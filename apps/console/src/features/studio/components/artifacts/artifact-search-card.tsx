"use client";

/**
 * @file artifact-search-card.tsx
 * @description Web search and cited sources artifact view with domain tags and relevance ratings.
 * @module apps/console/features/studio/components/artifacts
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Globe, Search } from "lucide-react";
import { Badge } from "@yuva-devlab/ui";
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
    <div className="border-border/80 bg-card/70 my-2 overflow-hidden rounded-md border shadow-sm">
      <div
        className={`bg-muted/30 flex items-center justify-between px-3.5 py-2 font-mono text-xs ${
          isExpanded ? "border-border/60 border-b" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-foreground flex min-w-0 items-center gap-2 text-left font-mono text-xs font-semibold transition-opacity hover:opacity-80"
        >
          <Search className="size-4 shrink-0 text-cyan-400" />
          <span className="truncate">{artifact.title}</span>
          <span className="text-muted-foreground ml-1 flex items-center gap-0.5 text-[10px]">
            <span>{isExpanded ? UI_COPY.COMMON.ACTIONS.HIDE : UI_COPY.COMMON.ACTIONS.SHOW}</span>
            {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </span>
        </button>

        {sources.length > 0 && (
          <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
            {UI_COPY.STUDIO.ARTIFACTS.SOURCES_COUNT(sources.length)}
          </Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2 p-4">
          {sources.length > 0 ? (
            sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border/60 hover:border-primary/40 bg-background/50 hover:bg-background/80 group flex items-start justify-between rounded-md border p-2.5 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-foreground group-hover:text-primary flex items-center gap-1.5 text-xs font-medium">
                    <Globe className="text-muted-foreground size-3.5" />
                    <span className="truncate">{src.title}</span>
                  </div>
                  {src.snippet && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-relaxed">
                      {src.snippet}
                    </p>
                  )}
                </div>
                <ExternalLink className="text-muted-foreground group-hover:text-primary mt-0.5 ml-2 size-3.5 shrink-0" />
              </a>
            ))
          ) : (
            <div className="bg-background/40 text-foreground rounded-md p-3 font-sans text-xs leading-relaxed whitespace-pre-wrap">
              {artifact.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
