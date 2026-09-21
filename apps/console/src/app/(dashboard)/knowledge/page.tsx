import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { KnowledgePageContent } from "@/features/knowledge";

/**
 * SSR Page Shell for Knowledge Vector Documents.
 * Delegating all client interactive state and document rendering to KnowledgePageContent.
 */
export default function KnowledgePage(): React.JSX.Element {
  return (
    <PageShell
      title="Knowledge"
      breadcrumb="Knowledge"
      description="The retrieval layer agents consult before they answer. Every chunk is traceable back to its source."
    >
      <KnowledgePageContent />
    </PageShell>
  );
}
