/**
 * @file apps/console/src/app/(dashboard)/evaluations/page.tsx
 * @description Benchmark Capability Evaluations route.
 * @module apps/console/app/(dashboard)/evaluations
 */

import React from "react";
import dynamic from "next/dynamic";

const EvaluationsPageContent = dynamic(() =>
  import("@/features/evaluations").then((m) => ({ default: m.EvaluationsPageContent })),
);

export default function EvaluationsPage(): React.JSX.Element {
  return <EvaluationsPageContent />;
}
