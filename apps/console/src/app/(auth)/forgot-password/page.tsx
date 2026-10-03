import React from "react";
import type { Metadata } from "next";
import { AuthCardWrapper, ForgotPasswordForm } from "@/features/auth";
import { UI_COPY } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: UI_COPY.AUTH.FORGOT_PASSWORD.PAGE_TITLE,
  description: UI_COPY.AUTH.FORGOT_PASSWORD.PAGE_DESCRIPTION,
};

/**
 * Forgot Password Page segment for password recovery.
 */
export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <AuthCardWrapper
      title={UI_COPY.AUTH.FORGOT_PASSWORD.CARD_TITLE}
      subtitle={UI_COPY.AUTH.FORGOT_PASSWORD.CARD_SUBTITLE}
      footerPrompt={UI_COPY.AUTH.FORGOT_PASSWORD.FOOTER_PROMPT}
      footerLinkText={UI_COPY.AUTH.FORGOT_PASSWORD.FOOTER_LINK}
      footerLinkHref="/login"
    >
      <ForgotPasswordForm />
    </AuthCardWrapper>
  );
}
