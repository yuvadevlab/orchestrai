/**
 * @file apps/console/src/features/auth/components/login-view.tsx
 * @description Client view for OrchestrAI Console delegating authentication to DevLab Portal Central SSO.
 * Automatically purges stale session markers and redirects to DevLab SSO.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/features/auth
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ConsoleStorageKey,
  ConsoleCookieKey,
  ConsoleQueryParamKey,
  STORAGE_KEY,
  AUTH_COOKIE_NAME,
  TENANT_COOKIE_NAME,
} from "@/lib/auth/types";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";
import { isJwtExpired, parseJwtClaims } from "@/lib/jwt";
import { persistSession } from "@/lib/auth/session-storage";
import { AuthCardWrapper } from "./auth-card-wrapper";

export function LoginView(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam =
    searchParams.get(ConsoleQueryParamKey.TOKEN) ||
    searchParams.get(ConsoleQueryParamKey.ACCESS_TOKEN);
  const errorParam = searchParams.get("error") || searchParams.get("auth_error");

  const purgeAndRedirect = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ConsoleStorageKey.AUTH_SESSION);
      localStorage.removeItem(ConsoleStorageKey.DEVLAB_ACCESS_TOKEN);
      localStorage.removeItem(ConsoleStorageKey.DEVLAB_AUTH_TOKEN);
      localStorage.removeItem(ConsoleStorageKey.DEVLAB_AUTH_USER);
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${TENANT_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${ConsoleCookieKey.DEVLAB_ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      const portalUrl = DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: `${window.location.origin}/`,
        ...(errorParam ? { error: errorParam } : {}),
      });
      window.location.href = portalUrl;
    }
  }, [errorParam]);

  useEffect(() => {
    // If arriving with a valid SSO token, persist and transition to dashboard root
    if (tokenParam && !isJwtExpired(tokenParam)) {
      const claims = parseJwtClaims(tokenParam);
      const email = typeof claims?.email === "string" ? claims.email : "operator@devlab.internal";
      const name =
        typeof claims?.name === "string" ? claims.name : (email.split("@")[0] ?? "operator");

      persistSession({
        token: tokenParam,
        user: {
          id: String(claims?.sub || claims?.id || "devlab-user"),
          name,
          email,
          tenantId: String(claims?.tenantId || claims?.tenant_id || "default"),
          roles: Array.isArray(claims?.roles) ? (claims.roles as string[]) : ["operator"],
        },
      });

      router.replace("/");
      return;
    }

    purgeAndRedirect();
  }, [tokenParam, purgeAndRedirect, router]);

  return (
    <AuthCardWrapper
      title={UI_COPY.AUTH.SSO.REDIRECTING_TITLE}
      subtitle={UI_COPY.AUTH.SSO.REDIRECTING_DESC}
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
        onClick={purgeAndRedirect}
        className="dl-btn dl-btn--default dl-btn--md"
        style={{ width: "100%" }}
      >
        {UI_COPY.AUTH.SSO.CONTINUE_BUTTON}
      </button>
    </AuthCardWrapper>
  );
}
