/**
 * @file apps/console/src/app/(dashboard)/memory/page.tsx
 * @description Memory route redirected to consolidated /context hub.
 * @module apps/console/app/(dashboard)/memory
 */

import { redirect } from "next/navigation";

/**
 * Server-side redirect forwarding legacy /memory route to consolidated /context hub tab.
 */
export default function MemoryRedirect(): never {
  redirect("/context?tab=memory");
}
