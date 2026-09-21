import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ActivityPageContent } from "@/features/activity";

/**
 * SSR Page Shell for System Activity & Audit Log.
 * Delegating all client interactive state and telemetry rendering to ActivityPageContent.
 */
export default function ActivityPage(): React.JSX.Element {
  return (
    <PageShell
      title="Activity"
      breadcrumb="Activity"
      description="The system's own record of what changed, what ran, and what needed an operator."
    >
      <ActivityPageContent />
    </PageShell>
  );
}
