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

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

/**
 * Threaded Cowork Studio session page rendering the active thread and canvas.
 *
 * @param props - Next.js dynamic route parameters containing sessionId promise
 * @returns JSX element containing StudioWorkspace bound to target sessionId
 */
export default async function SessionPage({
  params,
}: SessionPageProps): Promise<React.JSX.Element> {
  const { sessionId } = await params;
  return <StudioWorkspace routeSessionId={sessionId} />;
}
