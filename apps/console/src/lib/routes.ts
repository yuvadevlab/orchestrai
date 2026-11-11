/**
 * @file apps/console/src/lib/routes.ts
 * @description Centralized application and DevLab SSO route path catalog.
 * Eliminates hardcoded URL string literals and provides canonical SSO redirect builders.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/lib/routes
 */

export const DEVLAB_PORTAL_WEB_URL =
  process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL || "http://localhost:3000";

export const APP_ID = "orchestrai";

/** Options for initiating authentication against DevLab Portal SSO */
export interface DevLabPortalLoginOptions {
  redirectUrl?: string;
  error?: string;
  prompt?: "login" | "select_account" | "consent";
}

/** DevLab Central Portal SSO route builders and canonical destinations */
export const DEVLAB_PORTAL_ROUTES = {
  LOGIN: (redirectUrlOrOptions?: string | DevLabPortalLoginOptions): string => {
    let redirectUrl: string | undefined;
    let error: string | undefined;
    let prompt: string | undefined;

    if (typeof redirectUrlOrOptions === "object" && redirectUrlOrOptions !== null) {
      redirectUrl = redirectUrlOrOptions.redirectUrl;
      error = redirectUrlOrOptions.error;
      prompt = redirectUrlOrOptions.prompt;
    } else {
      redirectUrl = redirectUrlOrOptions;
    }

    const base = `${DEVLAB_PORTAL_WEB_URL}/login?app=${encodeURIComponent(APP_ID)}`;
    try {
      const url = new URL(base);
      if (redirectUrl) {
        url.searchParams.set("redirect", redirectUrl);
      }
      if (error) {
        url.searchParams.set("error", error);
      }
      if (prompt) {
        url.searchParams.set("prompt", prompt);
      }
      return url.toString();
    } catch {
      let result = base;
      if (redirectUrl) result += `&redirect=${encodeURIComponent(redirectUrl)}`;
      if (error) result += `&error=${encodeURIComponent(error)}`;
      if (prompt) result += `&prompt=${encodeURIComponent(prompt)}`;
      return result;
    }
  },
  REGISTER: (): string => `${DEVLAB_PORTAL_WEB_URL}/register?app=${encodeURIComponent(APP_ID)}`,
  FORGOT_PASSWORD: (): string =>
    `${DEVLAB_PORTAL_WEB_URL}/forgot-password?app=${encodeURIComponent(APP_ID)}`,
  RESET_PASSWORD: (): string =>
    `${DEVLAB_PORTAL_WEB_URL}/reset-password?app=${encodeURIComponent(APP_ID)}`,
} as const;

/** Client-side Next.js route paths */
export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  CONTEXT: "/context",
  AGENTS: "/agents",
  EXECUTIONS: "/executions",
  EVALUATIONS: "/evaluations",
  TOOLS: "/tools",
  MODELS: "/models",
  SETTINGS: "/settings",
} as const;
