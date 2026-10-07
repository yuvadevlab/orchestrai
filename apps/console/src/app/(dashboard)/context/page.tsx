/**
 * @file apps/console/src/app/(dashboard)/context/page.tsx
 * @description Consolidated Context Hub route (RAG Knowledge + Agent Memory).
 * @module apps/console/app/(dashboard)/context
 */

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/skeleton";

const ContextHubPageContent = dynamic(() =>
  import("@/features/context").then((m) => ({ default: m.ContextHubPageContent })),
);

/**
 * Context Hub page rendering tabs for indexed documents and persistent memory facts.
 *
 * @returns JSX element containing ContextHubPageContent wrapped in suspense fallback
 */
export default function ContextPage(): React.JSX.Element {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ContextHubPageContent />
    </Suspense>
  );
}
