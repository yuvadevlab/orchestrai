import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ExecutionsPageContent } from "@/features/executions";

/**
 * SSR Page Shell for Execution History & Traces.
 * Delegating all client state and table rendering to ExecutionsPageContent.
 */
export default function ExecutionsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Executions"
      breadcrumb="Executions"
      description="A replayable record of execution DAG runs, step checkpoints, and forensic traces."
    >
      <ExecutionsPageContent />
    </PageShell>
  );
}
