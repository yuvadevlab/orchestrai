/**
 * @file apps/console/src/middleware.ts
 * @description Authentication edge middleware enforcing session checks and DevLab SSO redirect.
 * Modeled after FinAI's centralized authentication architecture.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/middleware
 */

import { NextResponse, type NextRequest } from "next/server";
import { ConsoleQueryParamKey, ConsoleCookieKey, AUTH_COOKIE_NAME } from "./lib/auth/types";
import { DEVLAB_PORTAL_ROUTES } from "./lib/routes";
import { isJwtExpired } from "./lib/jwt";

const AUTH_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

/**
 * Authentication middleware running before route execution.
 * Intercepts incoming SSO tokens, manages authentication cookies,
 * and delegates unauthenticated users to DevLab Portal Central SSO.
 */
export function middleware(request: NextRequest): NextResponse {
  // 1. If returning from DevLab Portal SSO with token in query params
  const tokenParam =
    request.nextUrl.searchParams.get(ConsoleQueryParamKey.TOKEN) ||
    request.nextUrl.searchParams.get(ConsoleQueryParamKey.ACCESS_TOKEN);

  if (tokenParam && tokenParam.trim().length > 0) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete(ConsoleQueryParamKey.TOKEN);
    cleanUrl.searchParams.delete(ConsoleQueryParamKey.ACCESS_TOKEN);

    // If redirected to an auth path (like /login or /signup), send to dashboard root
    const isAuthPath = AUTH_PATH_PREFIXES.some((prefix) => cleanUrl.pathname.startsWith(prefix));
    if (isAuthPath) {
      cleanUrl.pathname = "/";
    }

    // If token is actively valid, set session cookies and redirect to clean target
    if (!isJwtExpired(tokenParam)) {
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set(AUTH_COOKIE_NAME, tokenParam, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
      });
      response.cookies.set(ConsoleCookieKey.DEVLAB_ACCESS_TOKEN, tokenParam, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
      });
      return response;
    }
  }

  // 2. Validate token from cookies
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    request.cookies.get(ConsoleCookieKey.DEVLAB_ACCESS_TOKEN)?.value;

  const isCurrentAuthPath = AUTH_PATH_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  // If already authenticated and visiting an auth path (/login), forward to dashboard
  if (isCurrentAuthPath) {
    if (token && !isJwtExpired(token)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected route: redirect to DevLab Portal Central SSO if unauthenticated
  if (!token || isJwtExpired(token)) {
    const response = NextResponse.redirect(
      DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: request.url,
      }),
    );
    if (token) {
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete(ConsoleCookieKey.DEVLAB_ACCESS_TOKEN);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset files (containing a dot: .png, .jpg, .svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
