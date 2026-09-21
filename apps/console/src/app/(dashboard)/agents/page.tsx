import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { AgentsPageContent } from "@/features/agents";

/**
 * SSR Page Shell for Agent Roster Management.
 * Delegating all client state and interactive rendering to AgentsPageContent.
 */
export default function AgentsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Agent Roster"
      breadcrumb="Agents"
      description="Every autonomous agent entity available to the orchestrator, with its operating mode, capabilities, and reliability."
    >
      <AgentsPageContent />
    </PageShell>
  );
}
