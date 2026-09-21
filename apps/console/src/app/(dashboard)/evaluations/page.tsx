import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { EvaluationsPageContent } from "@/features/evaluations";

/**
 * SSR Page Shell for Evaluation Suite Benchmark Results.
 * Delegating all client interactive state and score rendering to EvaluationsPageContent.
 */
export default function EvaluationsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Evaluations"
      breadcrumb="Evaluations"
      description="How well the system performs when it is graded rather than watched."
    >
      <EvaluationsPageContent />
    </PageShell>
  );
}
