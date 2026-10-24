/**
 * @file apps/console/src/lib/auth/client.ts
 * @description Enterprise authentication client managing HTTP requests to Gateway API.
 * @module apps/console/lib/auth
 */

import { formatApiError } from "../error-utils";
import {
  type AuthUser,
  type AuthSession,
  type LoginPayload,
  type SignupPayload,
  type ForgotPasswordPayload,
} from "./types";
import { persistSession } from "./session-storage";

export * from "./types";
export * from "./session-storage";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4002";

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
    const userMessage = formatApiError(
      fetchErr,
      "Unable to connect to the authentication server. Please verify the gateway is online.",
    );
    throw new Error(userMessage, { cause: fetchErr });
  }

  if (res.ok) {
    return (await res.json()) as T;
  }

  let errorMessage = fallbackMsg;
  try {
    const errorJson = await res.json();
    if (errorJson?.error?.message) {
      errorMessage = errorJson.error.message;
    } else if (errorJson?.message) {
      errorMessage = errorJson.message;
    }
  } catch {
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
