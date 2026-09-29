/**
 * @file apps/console/src/app/(dashboard)/context/page.tsx
 * @description Consolidated Context Hub route (RAG Knowledge + Agent Memory).
 * @module apps/console/app/(dashboard)/context
 */

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const ContextHubPageContent = dynamic(() =>
  import("@/features/context").then((m) => ({ default: m.ContextHubPageContent })),
);

export default function ContextPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading Context Hub...
          </span>
        </div>
      }
    >
      <ContextHubPageContent />
    </Suspense>
  );
}
