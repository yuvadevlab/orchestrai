"use client";

/**
 * @file artifact-renderer.tsx
 * @description Artifact router and renderer for multi-domain cowork outputs.
 * @module apps/console/features/studio/components/artifacts
 */

import React from "react";
import { ArtifactDocumentCard } from "./artifact-document-card";
import { ArtifactCodeCard } from "./artifact-code-card";
import { ArtifactTerminalCard } from "./artifact-terminal-card";
import { ArtifactSearchCard } from "./artifact-search-card";
import type { CoworkArtifact } from "../../types";

export interface ArtifactRendererProps {
  artifact: CoworkArtifact;
}

/**
 * Dispatches artifact to the appropriate visual card renderer.
 */
export function ArtifactRenderer({ artifact }: ArtifactRendererProps): React.JSX.Element {
  switch (artifact.type) {
    case "document":
      return <ArtifactDocumentCard artifact={artifact} />;
    case "code":
      return <ArtifactCodeCard artifact={artifact} />;
    case "terminal":
      return <ArtifactTerminalCard artifact={artifact} />;
    case "search":
      return <ArtifactSearchCard artifact={artifact} />;
    default:
      return <ArtifactDocumentCard artifact={artifact} />;
  }
}
