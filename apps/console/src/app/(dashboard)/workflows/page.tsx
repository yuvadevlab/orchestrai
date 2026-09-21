import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { WorkflowsPageContent } from "@/features/workflows";

/**
 * SSR Page Shell for Orchestration Workflow Canvas.
 * Delegating all client interactive state and graph rendering to WorkflowsPageContent.
 */
export default function WorkflowsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Workflows"
      breadcrumb="Workflows"
      description="Pre-composed orchestration paths and visual DAG graphs that can be launched and watched."
    >
      <WorkflowsPageContent />
    </PageShell>
  );
}
