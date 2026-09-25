/**
 * @file page.tsx
 * @description Threaded Cowork Studio session route.
 * @module apps/console/app/(dashboard)/session/[sessionId]
 */

import React from "react";
import dynamic from "next/dynamic";

const StudioWorkspace = dynamic(() =>
  import("@/features/studio").then((m) => ({ default: m.StudioWorkspace })),
);

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<React.JSX.Element> {
  const { sessionId } = await params;
  return <StudioWorkspace routeSessionId={sessionId} />;
}
