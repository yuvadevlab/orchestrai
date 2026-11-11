/**
 * @file apps/console/src/app/(dashboard)/knowledge/page.tsx
 * @description Knowledge route redirected to consolidated /context hub.
 * @module apps/console/app/(dashboard)/knowledge
 */

import { redirect } from "next/navigation";
import { ConsoleQueryParamKey, ConsoleRoutePath } from "@/lib/auth/types";
import { ContextTab } from "@/features/context/context-hub-page-content";

export default function KnowledgeRedirect(): never {
  const url = new URL(ConsoleRoutePath.CONTEXT, "http://localhost");
  url.searchParams.set(ConsoleQueryParamKey.TAB, ContextTab.KNOWLEDGE);
  redirect(`${url.pathname}${url.search}`);
}
