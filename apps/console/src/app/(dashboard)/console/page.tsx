import React from "react";
import { ConsolePageContent } from "@/features/console";

/**
 * SSR Page Shell for OrchestrAI Live Agent Console.
 * Delegating all client interactive state and live streaming to ConsolePageContent.
 */
export default function ConsolePage(): React.JSX.Element {
  return <ConsolePageContent />;
}
