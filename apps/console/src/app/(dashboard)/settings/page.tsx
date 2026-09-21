import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SettingsPageContent } from "@/features/settings";

/**
 * SSR Page Shell for System & Orchestration Configuration.
 * Delegating all client interactive state and toggle controls to SettingsPageContent.
 */
export default function SettingsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Settings"
      breadcrumb="Settings"
      description="How much the orchestrator may decide on its own, and where an operator stays in the loop."
    >
      <SettingsPageContent />
    </PageShell>
  );
}
