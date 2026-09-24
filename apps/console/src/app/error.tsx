/**
 * @file error.tsx
 * @description Global client error boundary component for Next.js App Router in OrchestrAI Console.
 * @module apps/console/app
 */

"use client";

import React, { useEffect } from "react";
import { DynamicErrorState } from "@/components/ui/error-state";

export interface GlobalErrorProps {
  /** Unhandled JavaScript error or API exception */
  error: Error & { digest?: string };
  /** Function to attempt resetting the error boundary */
  reset: () => void;
}

/**
 * Next.js App Router Root Error Boundary component.
 * Integrates client console logger and cybernetic error classifier.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    // Log unexpected frontend runtime crash to browser console
    // eslint-disable-next-line no-console
    console.error("[ConsoleRootErrorBoundary] Root React Error Boundary caught unhandled crash:", {
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="bg-background min-h-screen">
      <DynamicErrorState
        error={error}
        reset={reset}
        boundaryName="AppRoot"
        className="min-h-screen"
      />
    </div>
  );
}
