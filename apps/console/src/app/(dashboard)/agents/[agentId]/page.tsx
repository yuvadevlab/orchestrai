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

interface AgentDetailPageProps {
  params: Promise<{ agentId: string }>;
}

/**
 * Agent detail page rendering configuration editor, system instructions, and tool assignments.
 *
 * @param props - Next.js dynamic route parameters containing agentId promise
 * @returns JSX element containing AgentDetailPageContent
 */
export default async function AgentDetailPage({
  params,
}: AgentDetailPageProps): Promise<React.JSX.Element> {
  const { agentId } = await params;
  return <AgentDetailPageContent agentId={agentId} />;
}
