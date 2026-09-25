/**
 * @file apps/console/src/lib/auth-client.ts
 * @description Enterprise authentication client managing HTTP requests, secure cookies, and cross-tab sync.
 * @module apps/console/lib
 */

import { formatApiError } from "./error-utils";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: string[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export const STORAGE_KEY = process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || "orchestrai_auth_session";
export const BROADCAST_CHANNEL =
  process.env.NEXT_PUBLIC_BROADCAST_CHANNEL_NAME || "orchestrai_auth_sync";
export const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "orch_token";
export const TENANT_COOKIE_NAME = process.env.NEXT_PUBLIC_TENANT_COOKIE_NAME || "orch_tenant";
export const SESSION_MAX_AGE = Number(process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS || 604800);
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4001";

/**
 * Safely executes an HTTP request to the Gateway API, handling network failures and parsing structured errors.
 */
async function safeAuthFetch<T>(
  endpoint: string,
  init: RequestInit,
  fallbackMsg: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${GATEWAY_URL}${endpoint}`, init);
  } catch (fetchErr) {
    // Network failure, offline, connection refused, or CORS blockage
    const userMessage = formatApiError(
      fetchErr,
      "Unable to connect to the authentication server. Please verify the gateway is online.",
    );
    throw new Error(userMessage, { cause: fetchErr });
  }

  // Handle successful response
  if (res.ok) {
    return (await res.json()) as T;
  }

  // Parse structured error payload if response is non-2xx
  let errorMessage = fallbackMsg;
  try {
    const errorJson = await res.json();
    if (errorJson?.error?.message) {
      errorMessage = errorJson.error.message;
    } else if (errorJson?.message) {
      errorMessage = errorJson.message;
    }
  } catch {
    // Non-JSON response body received
    if (res.status === 401) {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (res.status === 404) {
      errorMessage = "No account found with this email address.";
    } else if (res.status === 409) {
      errorMessage = "An account with this email address already exists.";
    }
  }

  throw new Error(errorMessage);
}

/**
 * Reads the active session from browser localStorage.
 */
export function getStoredSession(): AuthSession | null {
  // Guard against SSR execution where window is undefined
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // If key does not exist, return null
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Persists an authenticated session into storage, cookies, and broadcasts to other tabs.
 */
export function persistSession(session: AuthSession): void {
  // Guard against server-side rendering
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  // Set secure cookies for Next.js Edge Middleware route guards
  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(session.token)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax${secureFlag}`;
  document.cookie = `${TENANT_COOKIE_NAME}=${encodeURIComponent(session.user.tenantId)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax${secureFlag}`;

  // Broadcast to other open browser tabs
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.postMessage({ type: "AUTH_LOGIN", session });
    channel.close();
  } catch {
    // BroadcastChannel unsupported fallback
  }
}

/**
 * Clears the active session and cookies across all tabs.
 */
export function clearSession(): void {
  // Guard against server-side rendering
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${TENANT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.postMessage({ type: "AUTH_LOGOUT" });
    channel.close();
  } catch {
    // BroadcastChannel unsupported fallback
  }
}

/**
 * Authenticates user credentials with Gateway.
 */
export async function apiLogin(payload: LoginPayload): Promise<AuthSession> {
  const data = await safeAuthFetch<{ token: string; user: AuthUser }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Invalid email or password",
  );

  const session: AuthSession = { token: data.token, user: data.user };
  persistSession(session);
  return session;
}

/**
 * Registers a new operator account with Gateway.
 */
export async function apiSignup(payload: SignupPayload): Promise<AuthSession> {
  const data = await safeAuthFetch<{ token: string; user: AuthUser }>(
    "/api/v1/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Registration failed. Please try again.",
  );

  const session: AuthSession = { token: data.token, user: data.user };
  persistSession(session);
  return session;
}

/**
 * Dispatches password reset instructions via Gateway.
 */
export async function apiForgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  return safeAuthFetch<{ message: string }>(
    "/api/v1/auth/forgot-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Failed to process password recovery request",
  );
}

/**
 * Verifies active session token against Gateway.
 */
export async function apiFetchSession(token: string): Promise<AuthUser> {
  const data = await safeAuthFetch<{ user: AuthUser }>(
    "/api/v1/auth/session",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
    "Session expired or invalid",
  );

  return data.user;
}
