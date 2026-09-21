import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ModelsPageContent } from "@/features/models";

/**
 * SSR Page Shell for Model Providers and Routing.
 * Delegating all client interactive state and provider rendering to ModelsPageContent.
 */
export default function ModelsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Models"
      breadcrumb="Models"
      description="Routing options for reasoning work, LLM provider endpoints, context windows, and real-time latency."
    >
      <ModelsPageContent />
    </PageShell>
  );
}
