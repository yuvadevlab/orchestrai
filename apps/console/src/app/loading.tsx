/**
 * @file loading.tsx
 * @description Global suspense loading fallback for Next.js App Router in OrchestrAI Console.
 * @module apps/console/app
 */

import React from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Global App Suspense Fallback component matching reference style layout.
 */
export default function Loading(): React.JSX.Element {
  return (
    <LoadingState
      title={UI_COPY.COMMON.LOADING.TITLE}
      description={UI_COPY.COMMON.LOADING.DESCRIPTION}
    />
  );
}
