/**
 * @file page.tsx
 * @description Agent Roster route.
 * @module apps/console/app/(dashboard)/agents
 */

import React from "react";
import dynamic from "next/dynamic";

const AgentsPageContent = dynamic(() =>
  import("@/features/agents").then((m) => ({ default: m.AgentsPageContent })),
);

export default function AgentsPage(): React.JSX.Element {
  return <AgentsPageContent />;
}
