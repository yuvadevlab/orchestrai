/**
 * @file apps/console/src/app/(dashboard)/knowledge/page.tsx
 * @description Knowledge Base and RAG Document Registry route.
 * @module apps/console/app/(dashboard)/knowledge
 */

import React from "react";
import dynamic from "next/dynamic";

const KnowledgePageContent = dynamic(() =>
  import("@/features/knowledge").then((m) => ({ default: m.KnowledgePageContent })),
);

export default function KnowledgePage(): React.JSX.Element {
  return <KnowledgePageContent />;
}
