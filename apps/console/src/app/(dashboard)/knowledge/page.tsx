/**
 * @file apps/console/src/app/(dashboard)/knowledge/page.tsx
 * @description Knowledge route redirected to consolidated /context hub.
 * @module apps/console/app/(dashboard)/knowledge
 */

import { redirect } from "next/navigation";

/**
 * Server-side redirect forwarding legacy /knowledge route to consolidated /context hub tab.
 */
export default function KnowledgeRedirect(): never {
  redirect("/context?tab=knowledge");
}
