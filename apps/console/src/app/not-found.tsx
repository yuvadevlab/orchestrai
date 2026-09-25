/**
 * @file not-found.tsx
 * @description Root 404 handler for Next.js App Router in OrchestrAI Console.
 * @module apps/console/app
 */

import React from "react";
import { NotFoundState } from "@/components/ui/not-found-state";

/**
 * Root 404 Page Component.
 */
export default function NotFound(): React.JSX.Element {
  return <NotFoundState />;
}
