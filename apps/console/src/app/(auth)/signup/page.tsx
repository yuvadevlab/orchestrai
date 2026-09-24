import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardWrapper, SignupForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign Up — OrchestrAI",
  description: "Create an account to access OrchestrAI Console.",
};

/**
 * Signup Page segment for user registration.
 */
export default function SignupPage(): React.JSX.Element {
  return (
    <AuthCardWrapper
      title="Create an account"
      subtitle="Enter your email and password to get started"
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <Suspense fallback={<div className="bg-muted/20 h-40 animate-pulse rounded-md" />}>
        <SignupForm />
      </Suspense>
    </AuthCardWrapper>
  );
}
