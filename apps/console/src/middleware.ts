/**
 * @file apps/console/src/middleware.ts
 * @description Next.js Edge middleware enforcing authentication guards on protected dashboard routes.
 */

import { NextResponse, type NextRequest } from "next/server";

/** Paths accessible to unauthenticated visitors */
const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

/**
 * Edge middleware intercepting requests to enforce session token presence.
 *
 * @param request - Inbound Next.js HTTP request
 * @returns NextResponse redirecting unauthenticated or authenticated users appropriately
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "orch_token";
  const tokenCookie = request.cookies.get(cookieName);
  const isAuthenticated = Boolean(tokenCookie?.value && tokenCookie.value.trim().length > 0);

  // Check if current requested route is an authentication route (login, signup, forgot-password)
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // 1. Unauthenticated users attempting to access protected dashboard routes get redirected to /login
  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserve original target path for post-login redirect
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users attempting to access /login, /signup, or /forgot-password get redirected to dashboard /
  if (isAuthenticated && isAuthRoute) {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow request to proceed to route handler
  return NextResponse.next();
}

/**
 * Configure path matching rules to exclude internal Next.js assets, static files, and public images.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (*.png, *.svg, *.jpg, *.jpeg, *.gif, *.webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
