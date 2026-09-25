/**
 * @file page.tsx
 * @description Execution History & Traces route.
 * @module apps/console/app/(dashboard)/executions
 */

import React from "react";
import dynamic from "next/dynamic";
const ExecutionsPageContent = dynamic(() =>
  import("@/features/executions").then((m) => ({ default: m.ExecutionsPageContent })),
);

export default function ExecutionsPage(): React.JSX.Element {
  return <ExecutionsPageContent />;
}
