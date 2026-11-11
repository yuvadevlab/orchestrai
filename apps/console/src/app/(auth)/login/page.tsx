/**
 * @file apps/console/src/app/(auth)/login/page.tsx
 * @description Pure SSR Server Component route wrapper for OrchestrAI Console SSO login.
 * Delegates authentication directly to DevLab Central Portal SSO.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/app/auth
 */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LoginView } from "@/features/auth";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: UI_COPY.AUTH.LOGIN.PAGE_TITLE,
  description: UI_COPY.AUTH.LOGIN.PAGE_DESCRIPTION,
};

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
