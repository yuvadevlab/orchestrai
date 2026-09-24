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

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}): Promise<React.JSX.Element> {
  const { executionId } = await params;

  return <ExecutionDetailPageContent executionId={executionId} />;
}
