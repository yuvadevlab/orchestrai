/**
 * @file apps/console/src/app/(dashboard)/memory/page.tsx
 * @description Memory route redirected to consolidated /context hub.
 * @module apps/console/app/(dashboard)/memory
 */

import { redirect } from "next/navigation";
import { ConsoleQueryParamKey, ConsoleRoutePath } from "@/lib/auth/types";
import { ContextTab } from "@/features/context/context-hub-page-content";

export default function MemoryRedirect(): never {
  const url = new URL(ConsoleRoutePath.CONTEXT, "http://localhost");
  url.searchParams.set(ConsoleQueryParamKey.TAB, ContextTab.MEMORY);
  redirect(`${url.pathname}${url.search}`);
}
