/**
 * @file page.tsx
 * @description Tool Capability Registry route.
 * @module apps/console/app/(dashboard)/tools
 */

import React from "react";
import dynamic from "next/dynamic";

const ToolsPageContent = dynamic(() =>
  import("@/features/tools").then((m) => ({ default: m.ToolsPageContent })),
);

/**
 * Tools page rendering catalog of system tools, permissions, and sandbox policies.
 *
 * @returns JSX element containing ToolsPageContent
 */
export default function ToolsPage(): React.JSX.Element {
  return <ToolsPageContent />;
}
