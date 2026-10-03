import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardWrapper, SignupForm } from "@/features/auth";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: UI_COPY.AUTH.SIGNUP.PAGE_TITLE,
  description: UI_COPY.AUTH.SIGNUP.PAGE_DESCRIPTION,
};

/**
 * Signup Page segment for user registration.
 */
export default function SignupPage(): React.JSX.Element {
  return (
    <AuthCardWrapper
      title={UI_COPY.AUTH.SIGNUP.CARD_TITLE}
      subtitle={UI_COPY.AUTH.SIGNUP.CARD_SUBTITLE}
      footerPrompt={UI_COPY.AUTH.SIGNUP.FOOTER_PROMPT}
      footerLinkText={UI_COPY.AUTH.SIGNUP.FOOTER_LINK}
      footerLinkHref="/login"
    >
      <Suspense fallback={<div className="bg-muted/20 h-40 animate-pulse rounded-md" />}>
        <SignupForm />
      </Suspense>
    </AuthCardWrapper>
  );
}
