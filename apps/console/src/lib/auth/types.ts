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

export enum ConsoleQueryParamKey {
  APP = "app",
  REDIRECT = "redirect",
  TOKEN = "token",
  ACCESS_TOKEN = "access_token",
  PROMPT = "prompt",
  TAB = "tab",
}

export enum ConsoleStorageKey {
  AUTH_SESSION = "orchestrai_auth_session",
  DEVLAB_ACCESS_TOKEN = "devlab_access_token",
  DEVLAB_AUTH_TOKEN = "devlab_auth_token",
  DEVLAB_AUTH_USER = "devlab_auth_user",
  COWORK_SESSIONS = "orchestrai_cowork_sessions",
  ACTIVE_SESSION_ID = "orchestrai_active_session_id",
}

export enum ConsoleCookieKey {
  AUTH_TOKEN = "orch_token",
  TENANT = "orch_tenant",
  DEVLAB_ACCESS_TOKEN = "devlab_access_token",
}

export enum ConsoleRoutePath {
  HOME = "/",
  LOGIN = "/login",
  SIGNUP = "/signup",
  FORGOT_PASSWORD = "/forgot-password",
  CONTEXT = "/context",
}

export const STORAGE_KEY =
  process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || ConsoleStorageKey.AUTH_SESSION;
export const BROADCAST_CHANNEL =
  process.env.NEXT_PUBLIC_BROADCAST_CHANNEL_NAME || "orchestrai_auth_sync";
export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || ConsoleCookieKey.AUTH_TOKEN;
export const TENANT_COOKIE_NAME =
  process.env.NEXT_PUBLIC_TENANT_COOKIE_NAME || ConsoleCookieKey.TENANT;
export const SESSION_MAX_AGE = Number(process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS || 604800);
