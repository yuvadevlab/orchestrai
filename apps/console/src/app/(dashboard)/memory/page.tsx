import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { MemoryPageContent } from "@/features/memory";

/**
 * SSR Page Shell for Agent Memory Inspection.
 * Delegating all client interactive state and memory store rendering to MemoryPageContent.
 */
export default function MemoryPage(): React.JSX.Element {
  return (
    <PageShell
      title="Memory"
      breadcrumb="Memory"
      description="What the system retains, how confident it is, and when each record was last recalled."
    >
      <MemoryPageContent />
    </PageShell>
  );
}
