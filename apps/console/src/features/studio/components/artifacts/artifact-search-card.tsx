"use client";

/**
 * @file artifact-search-card.tsx
 * @description Web search and cited sources artifact view with domain tags and relevance ratings.
 * @module apps/console/features/studio/components/artifacts
 */

import React from "react";
import { ExternalLink, Globe, Search } from "lucide-react";
import type { CoworkArtifact } from "../../types";

export interface ArtifactSearchCardProps {
  artifact: CoworkArtifact;
}

/**
 * Renders web search citations and retrieved intelligence snippets.
 */
export function ArtifactSearchCard({ artifact }: ArtifactSearchCardProps): React.JSX.Element {
  const sources = Array.isArray(artifact.metadata?.sources)
    ? (artifact.metadata.sources as Array<{ title: string; url: string; snippet?: string }>)
    : [];

  return (
    <div className="border-border/80 bg-card/70 my-3 overflow-hidden rounded-md border p-4 shadow-sm">
      <div className="text-foreground mb-3 flex items-center gap-2 font-mono text-xs font-semibold">
        <Search className="size-4 text-cyan-400" />
        <span>{artifact.title}</span>
      </div>

      <div className="space-y-2">
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
    </div>
  );
}
