/**
 * @file apps/console/src/features/auth/components/forgot-password-view.tsx
 * @description Client view redirecting password recovery to DevLab Portal Central SSO.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/features/auth
 */

"use client";

import React, { useEffect } from "react";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";
import { AuthCardWrapper } from "./auth-card-wrapper";

export function ForgotPasswordView(): React.JSX.Element {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.FORGOT_PASSWORD();
    }
  }, []);

  return (
    <AuthCardWrapper
      title={UI_COPY.AUTH.SSO.RECOVER_TITLE}
      subtitle={UI_COPY.AUTH.SSO.RECOVER_DESC}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBlock: "1rem" }}>
        <div
          style={{
            display: "grid",
            height: "3.5rem",
            width: "3.5rem",
            placeItems: "center",
            borderRadius: "var(--radius-lg, 0.5rem)",
            backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)",
            color: "var(--primary)",
          }}
        >
          <svg
            style={{ width: "1.75rem", height: "1.75rem", animation: "dl-spin 1s linear infinite" }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = DEVLAB_PORTAL_ROUTES.FORGOT_PASSWORD();
          }
        }}
        className="dl-btn dl-btn--default dl-btn--md"
        style={{ width: "100%" }}
      >
        {UI_COPY.AUTH.SSO.CONTINUE_BUTTON}
      </button>
    </AuthCardWrapper>
  );
}
