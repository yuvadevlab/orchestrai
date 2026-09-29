/**
 * @file apps/console/src/app/(dashboard)/console/page.tsx
 * @description Redundant console route redirected to workspace root.
 * @module apps/console/app/(dashboard)/console
 */

import { redirect } from "next/navigation";

/**
 * Server-side redirect from legacy /console route to primary studio workspace /.
 */
export default function ConsoleRedirect(): never {
  redirect("/");
}
