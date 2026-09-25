/**
 * @file loading.tsx
 * @description Global suspense loading fallback for Next.js App Router in OrchestrAI Console.
 * @module apps/console/app
 */

import React from "react";
import { LoadingState } from "@/components/ui/loading-state";

/**
 * Global App Suspense Fallback component matching reference style layout.
 */
export default function Loading(): React.JSX.Element {
  return (
    <LoadingState
      title="Initializing OrchestrAI Console..."
      description="Please wait while we prepare your view."
    />
  );
}
