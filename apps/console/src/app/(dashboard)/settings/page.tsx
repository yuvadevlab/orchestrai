/**
 * @file page.tsx
 * @description System & Orchestration Settings route.
 * @module apps/console/app/(dashboard)/settings
 */

import React from "react";
import dynamic from "next/dynamic";

const SettingsPageContent = dynamic(() =>
  import("@/features/settings").then((m) => ({ default: m.SettingsPageContent })),
);

export default function SettingsPage(): React.JSX.Element {
  return <SettingsPageContent />;
}
