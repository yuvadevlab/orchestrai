import React, { Suspense } from "react";
import { ConsolePageContent } from "@/features/console";

/**
 * SSR Page Shell for OrchestrAI Live Agent Console.
 * Delegating all client interactive state and live streaming to ConsolePageContent.
 */
export default function ConsolePage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex size-full items-center justify-center p-8 font-mono text-xs">
          Loading console...
        </div>
      }
    >
      <ConsolePageContent />
    </Suspense>
  );
}
