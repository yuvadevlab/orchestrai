import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ToolsPageContent } from "@/features/tools";

/**
 * SSR Page Shell for Tool Capability Registry.
 * Delegating all client interactive state and tool rendering to ToolsPageContent.
 */
export default function ToolsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Tools"
      breadcrumb="Tools"
      description="Everything the orchestrator is allowed to reach for, and the safety guardrails attached to each capability."
    >
      <ToolsPageContent />
    </PageShell>
  );
}
