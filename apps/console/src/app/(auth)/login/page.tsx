import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardWrapper, LoginForm } from "@/features/auth";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: UI_COPY.AUTH.LOGIN.PAGE_TITLE,
  description: UI_COPY.AUTH.LOGIN.PAGE_DESCRIPTION,
};

/**
 * Login Page segment for user authentication.
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <AuthCardWrapper
      title={UI_COPY.AUTH.LOGIN.CARD_TITLE}
      subtitle={UI_COPY.AUTH.LOGIN.CARD_SUBTITLE}
      footerPrompt={UI_COPY.AUTH.LOGIN.FOOTER_PROMPT}
      footerLinkText={UI_COPY.AUTH.LOGIN.FOOTER_LINK}
      footerLinkHref="/signup"
    >
      <Suspense fallback={<div className="bg-muted/20 h-40 animate-pulse rounded-md" />}>
        <LoginForm />
      </Suspense>
    </AuthCardWrapper>
  );
}
