import React from "react";
import type { Metadata } from "next";
import { AuthCardWrapper, ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset Password — OrchestrAI",
  description: "Reset your OrchestrAI password.",
};

/**
 * Forgot Password Page segment for password recovery.
 */
export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <AuthCardWrapper
      title="Reset your password"
      subtitle="Enter your email to receive recovery instructions"
      footerPrompt="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <ForgotPasswordForm />
    </AuthCardWrapper>
  );
}
