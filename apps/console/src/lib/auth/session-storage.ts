/**
 * @file apps/console/src/lib/auth/session-storage.ts
 * @description Session storage, cookie persistence, and cross-tab BroadcastChannel handlers.
 */

import {
  STORAGE_KEY,
  BROADCAST_CHANNEL,
  AUTH_COOKIE_NAME,
  TENANT_COOKIE_NAME,
  SESSION_MAX_AGE,
  type AuthSession,
} from "./types";

function parseJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(atob(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readCookieToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)(?:${AUTH_COOKIE_NAME}|devlab_access_token)=([^;]+)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthSession;
  } catch {
    // Continue to cookie fallback
  }

  const cookieToken = readCookieToken();
  if (cookieToken) {
    const payload = parseJwtPayload(cookieToken);
    const email = typeof payload?.email === "string" ? payload.email : "operator@devlab.internal";
    const name =
      typeof payload?.name === "string" ? payload.name : (email.split("@")[0] ?? "operator");
    const session: AuthSession = {
      token: cookieToken,
      user: {
        id: String(payload?.sub || payload?.id || "devlab-user"),
        name,
        email,
        tenantId: String(payload?.tenantId || payload?.tenant_id || "default"),
        roles: Array.isArray(payload?.roles) ? (payload.roles as string[]) : ["operator"],
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  return null;
}

export function persistSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(session.token)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax${secureFlag}`;
  document.cookie = `${TENANT_COOKIE_NAME}=${encodeURIComponent(session.user.tenantId)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax${secureFlag}`;
  document.cookie = `devlab_access_token=${encodeURIComponent(session.token)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax${secureFlag}`;

  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.postMessage({ type: "AUTH_LOGIN", session });
    channel.close();
  } catch {
    // Fallback if BroadcastChannel unsupported
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("devlab_access_token");
  localStorage.removeItem("devlab_auth_token");
  localStorage.removeItem("devlab_auth_user");
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${TENANT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `devlab_access_token=; path=/; max-age=0; SameSite=Lax`;

  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.postMessage({ type: "AUTH_LOGOUT" });
    channel.close();
  } catch {
    // Fallback if BroadcastChannel unsupported
  }
}
