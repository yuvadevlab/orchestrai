import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ExecutionDetailPageContent } from "@/features/executions";

/**
 * SSR Page Shell for Replayable Execution Session Detail.
 * Delegating all client interactive state and step trace rendering to ExecutionDetailPageContent.
 */
export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}): Promise<React.JSX.Element> {
  const { executionId } = await params;

  return (
    <PageShell
      title={`Execution / ${executionId}`}
      breadcrumb="Executions"
      description="Replayable execution session record with step checkpoints and recovery metadata."
    >
      <ExecutionDetailPageContent executionId={executionId} />
    </PageShell>
  );
}
