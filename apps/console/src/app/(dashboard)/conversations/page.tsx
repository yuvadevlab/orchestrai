import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ConversationsPageContent } from "@/features/conversations";

/**
 * SSR Page Shell for Conversations Management.
 * Delegating all client interactive state and thread rendering to ConversationsPageContent.
 */
export default function ConversationsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Conversations"
      breadcrumb="Conversations"
      description="Intent threads. Each one can be resumed in the console with its execution context intact."
    >
      <ConversationsPageContent />
    </PageShell>
  );
}
