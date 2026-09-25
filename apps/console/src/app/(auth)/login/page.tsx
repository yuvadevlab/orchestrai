import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardWrapper, LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign In — OrchestrAI",
  description: "Sign in to access OrchestrAI Console.",
};

/**
 * Login Page segment for user authentication.
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <AuthCardWrapper
      title="Sign in to OrchestrAI"
      subtitle="Enter your email and password below"
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
    >
      <Suspense fallback={<div className="bg-muted/20 h-40 animate-pulse rounded-md" />}>
        <LoginForm />
      </Suspense>
    </AuthCardWrapper>
  );
}
