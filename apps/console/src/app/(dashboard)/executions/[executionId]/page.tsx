/**
 * @file page.tsx
 * @description Execution Session Detail route.
 * @module apps/console/app/(dashboard)/executions/[executionId]
 */

import React from "react";
import dynamic from "next/dynamic";

const ExecutionDetailPageContent = dynamic(() =>
  import("@/features/executions").then((m) => ({ default: m.ExecutionDetailPageContent })),
);

interface ExecutionDetailPageProps {
  params: Promise<{ executionId: string }>;
}

/**
 * Execution detail page rendering step-level DAG execution timeline, traces, and tool payloads.
 *
 * @param props - Next.js dynamic route parameters containing executionId promise
 * @returns JSX element containing ExecutionDetailPageContent
 */
export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps): Promise<React.JSX.Element> {
  const { executionId } = await params;
  return <ExecutionDetailPageContent executionId={executionId} />;
}
