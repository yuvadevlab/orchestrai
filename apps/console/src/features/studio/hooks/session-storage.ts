/**
 * @file session-storage.ts
 * @description Local cache and server sync helpers for Cowork Studio sessions.
 * @module apps/console/features/studio/hooks
 */

import { getApiClient } from "@/lib/api-client";
import type { CoworkArtifact, CoworkMessage, CoworkMode, CoworkSession } from "../types";

export const SESSIONS_STORAGE_KEY = "orchestrai_cowork_sessions";
export const ACTIVE_SESSION_STORAGE_KEY = "orchestrai_active_session_id";

/**
 * Generates an RFC-4122 compliant v4 UUID for session identification.
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const r =
      typeof crypto !== "undefined"
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : Math.floor(Math.random() * 16);
    return (+c ^ ((r ?? 0) & (15 >> (+c / 4)))).toString(16);
  });
}

/**
 * Creates an empty in-memory draft session.
 */
export function createDraftSession(id?: string): CoworkSession {
  const sessionId = id || generateUUID();
  const now = new Date().toISOString();
  return {
    id: sessionId,
    title: "New Thread",
    createdAt: now,
    updatedAt: now,
    specialistId: "",
    model: "",
    mode: "auto",
    messages: [],
  };
}

/**
 * Reads cached sessions from browser localStorage with safe parse fallback.
 */
export function loadCachedSessions(): CoworkSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: CoworkSession[] = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((s) => Array.isArray(s.messages) && s.messages.length > 0)
      : [];
  } catch {
    return [];
  }
}

/**
 * Persists valid sessions to browser localStorage cache.
 */
export function saveCachedSessions(sessions: CoworkSession[]): void {
  if (typeof window === "undefined") return;
  try {
    const validOnly = sessions.filter((s) => s.messages && s.messages.length > 0);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(validOnly));
  } catch {
    // Graceful storage quota fallback
  }
}

/**
 * Reads cached active session ID from browser localStorage.
 */
export function loadCachedActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves active session ID to browser localStorage.
 */
export function saveCachedActiveId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, id);
  } catch {
    // Storage quota fallback
  }
}

/**
 * Maps raw server response item into typed CoworkSession.
 */
export function mapServerToCoworkSession(server: Record<string, unknown>): CoworkSession {
  const convId = String(server.conversationId || server.id || "");
  const messagesRaw = Array.isArray(server.messages) ? server.messages : [];
  const meta = (server.metadata as Record<string, unknown>) || {};

  const mappedMessages: CoworkMessage[] = messagesRaw.map((m: Record<string, unknown>) => {
    const msgMeta = (m.metadata as Record<string, unknown>) || {};
    const roleStr = String(m.role || "user").toLowerCase();
    const role: "user" | "agent" | "system" =
      roleStr === "assistant" ? "agent" : (roleStr as "user" | "agent" | "system");

    return {
      id: String(m.messageId || m.id || generateUUID()),
      role,
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      timestamp: m.createdAt
        ? new Date(String(m.createdAt)).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      model: (msgMeta.model as string) || (meta.model as string) || undefined,
      artifacts: Array.isArray(msgMeta.artifacts)
        ? (msgMeta.artifacts as CoworkArtifact[])
        : undefined,
    };
  });

  return {
    id: convId,
    title: String(server.title || "Untitled Session"),
    createdAt: String(server.createdAt || new Date().toISOString()),
    updatedAt: String(server.updatedAt || new Date().toISOString()),
    specialistId: String(server.agentId || meta.specialistId || ""),
    model: String(meta.model || ""),
    mode: (meta.mode as CoworkMode) || "auto",
    messages: mappedMessages,
  };
}

/**
 * Fetches all conversation sessions from PostgreSQL via the Gateway API.
 */
export async function fetchServerSessions(): Promise<CoworkSession[]> {
  try {
    const client = getApiClient();
    const res = await client.conversations.list({ limit: 50 });
    if (!res || !Array.isArray(res.items)) return [];
    return res.items.map((item) =>
      mapServerToCoworkSession(item as unknown as Record<string, unknown>),
    );
  } catch {
    return [];
  }
}

/**
 * Fetches message history for an individual conversation thread.
 */
export async function fetchServerSessionMessages(conversationId: string): Promise<CoworkMessage[]> {
  try {
    const client = getApiClient();
    const res = await client.conversations.getMessages(conversationId, { limit: 100 });
    if (!res || !Array.isArray(res.messages)) return [];

    return res.messages.map((m) => {
      const msgMeta = (m.metadata as Record<string, unknown>) || {};
      const roleStr = String(m.role || "user").toLowerCase();
      const role: "user" | "agent" | "system" =
        roleStr === "assistant" ? "agent" : (roleStr as "user" | "agent" | "system");

      return {
        id: String(m.messageId || generateUUID()),
        role,
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        timestamp: m.createdAt
          ? new Date(String(m.createdAt)).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        model: (msgMeta.model as string) || undefined,
        artifacts: Array.isArray(msgMeta.artifacts)
          ? (msgMeta.artifacts as CoworkArtifact[])
          : undefined,
      };
    });
  } catch {
    return [];
  }
}
