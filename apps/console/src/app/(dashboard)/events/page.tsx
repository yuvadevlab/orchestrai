import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { EventsPageContent } from "@/features/events";

/**
 * SSR Page Shell for Real-Time System Event Bus Stream.
 * Delegating all client interactive state and payload expansion to EventsPageContent.
 */
export default function EventsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Event Stream"
      breadcrumb="Events"
      description="Every signal the system emits. Expand a row for its raw JSON payload."
    >
      <EventsPageContent />
    </PageShell>
  );
}
