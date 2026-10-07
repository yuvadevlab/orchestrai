/**
 * @file page.tsx
 * @description Model Providers & Routing route.
 * @module apps/console/app/(dashboard)/models
 */

import React from "react";
import dynamic from "next/dynamic";

const ModelsPageContent = dynamic(() =>
  import("@/features/models").then((m) => ({ default: m.ModelsPageContent })),
);

/**
 * Models page rendering configured LLM provider integrations, model catalog, and connection health.
 *
 * @returns JSX element containing ModelsPageContent
 */
export default function ModelsPage(): React.JSX.Element {
  return <ModelsPageContent />;
}
