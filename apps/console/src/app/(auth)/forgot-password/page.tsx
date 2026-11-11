/**
 * @file apps/console/src/app/(auth)/forgot-password/page.tsx
 * @description Pure SSR Server Component route wrapper for OrchestrAI password recovery.
 * Delegates password recovery directly to DevLab Central Portal.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/app/auth
 */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordView } from "@/features/auth";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: UI_COPY.AUTH.FORGOT_PASSWORD.PAGE_TITLE,
  description: UI_COPY.AUTH.FORGOT_PASSWORD.PAGE_DESCRIPTION,
};

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordView />
    </Suspense>
  );
}
