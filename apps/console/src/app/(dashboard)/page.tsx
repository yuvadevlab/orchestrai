/**
 * @file page.tsx
 * @description Root Cowork Studio workspace route.
 * @module apps/console/app/(dashboard)
 */

import React from "react";
import dynamic from "next/dynamic";

const StudioWorkspace = dynamic(() =>
  import("@/features/studio").then((m) => ({ default: m.StudioWorkspace })),
);

/**
 * Root Cowork Studio page rendering the interactive multi-agent chat and artifact workspace.
 *
 * @returns JSX element containing the dynamic StudioWorkspace component
 */
export default function RootCoworkPage(): React.JSX.Element {
  return <StudioWorkspace />;
}
