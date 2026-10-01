/**
 * @file apps/console/src/app/(dashboard)/memory/page.tsx
 * @description Memory route redirected to consolidated /context hub.
 * @module apps/console/app/(dashboard)/memory
 */

import { redirect } from "next/navigation";

export default function MemoryRedirect(): never {
  redirect("/context?tab=memory");
}
