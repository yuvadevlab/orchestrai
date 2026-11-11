/**
 * @file apps/console/src/app/(auth)/signup/page.tsx
 * @description Pure SSR Server Component route wrapper for OrchestrAI operator registration.
 * Delegates registration directly to DevLab Central Portal.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/app/auth
 */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SignupView } from "@/features/auth";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: UI_COPY.AUTH.SIGNUP.PAGE_TITLE,
  description: UI_COPY.AUTH.SIGNUP.PAGE_DESCRIPTION,
};

export default function SignupPage(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <SignupView />
    </Suspense>
  );
}
