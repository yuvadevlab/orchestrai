/**
 * @file apps/console/src/lib/auth/types.ts
 * @description Types and storage constant declarations for OrchestrAI Console auth.
 */

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
