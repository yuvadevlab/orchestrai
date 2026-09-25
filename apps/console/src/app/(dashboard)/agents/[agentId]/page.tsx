/**
 * @file page.tsx
 * @description Agent Studio detail route.
 * @module apps/console/app/(dashboard)/agents/[agentId]
 */

import React from "react";
import dynamic from "next/dynamic";
const AgentDetailPageContent = dynamic(() =>
  import("@/features/agents").then((m) => ({ default: m.AgentDetailPageContent })),
);

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<React.JSX.Element> {
  const { agentId } = await params;

  return <AgentDetailPageContent agentId={agentId} />;
}
