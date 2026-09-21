import React from "react";
import { OverviewPageContent } from "@/features/overview";

/**
 * Overview / Command Center Route.
 * Delegating all client interactive state to OverviewPageContent.
 */
export default function OverviewPage(): React.JSX.Element {
  return <OverviewPageContent />;
}
