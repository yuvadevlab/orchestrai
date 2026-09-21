import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { AgentDetailPageContent } from "@/features/agents";

/**
 * SSR Page Shell for Agent Studio & Parameters Detail.
 * Delegating all client interactive state and specification rendering to AgentDetailPageContent.
 */
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<React.JSX.Element> {
  const { agentId } = await params;

  return (
    <PageShell
      title={`Agent / ${agentId}`}
      breadcrumb="Agents"
      description="Autonomous agent identity, system prompt boundaries, parameter specs, and recorded traces."
    >
      <AgentDetailPageContent agentId={agentId} />
    </PageShell>
  );
}
