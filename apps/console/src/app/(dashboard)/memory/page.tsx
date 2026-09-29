/**
 * @file apps/console/src/app/(dashboard)/memory/page.tsx
 * @description Agent Long-term Memory and Recall route.
 * @module apps/console/app/(dashboard)/memory
 */

import React from "react";
import dynamic from "next/dynamic";

const MemoryPageContent = dynamic(() =>
  import("@/features/memory").then((m) => ({ default: m.MemoryPageContent })),
);

export default function MemoryPage(): React.JSX.Element {
  return <MemoryPageContent />;
}
