/**
 * @file page.tsx
 * @description Cowork Studio console route.
 * @module apps/console/app/(dashboard)/console
 */

import React from "react";
import dynamic from "next/dynamic";

const StudioWorkspace = dynamic(() =>
  import("@/features/studio").then((m) => ({ default: m.StudioWorkspace })),
);

export default function ConsolePage(): React.JSX.Element {
  return <StudioWorkspace />;
}
